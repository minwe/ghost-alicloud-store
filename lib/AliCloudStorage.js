/**
 * AliCloud OSS storage module for Ghost blog 2.x
 * @see https://ghost.org/docs/concepts/storage-adapters/
 * @see https://help.aliyun.com/document_detail/32068.html
 */

'use strict';

const path = require('path');
const fs = require('fs');
const urlParse = require('url').parse;
const moment = require('moment');
const OSS = require('ali-oss');
const StorageBase = require('ghost-storage-base');

const utils = require('./utils');

class AliCloudStorage extends StorageBase {
  constructor(options) {
    super(options);

    this.options = options || {};

    utils.log(this.options);

    const ossOpts = Object.create(null);

    [
      'accessKeyId',
      'accessKeySecret',
      'region',
      'bucket',
      'endpoint',
      'cname',
      'timeout',
      'secure'
    ].forEach(key => {
      if (key in options) {
        ossOpts[key] = options[key];
      }
    });

    utils.log('ossOpts', ossOpts);

    this.client = new OSS(ossOpts);
  }

  /**
   * Saves the image to storage
   * - file is the express image object
   * - returns a promise which ultimately returns the full url to the uploaded image
   *
   * @param file
   * @param targetDir
   * @returns {*}
   */
  async save(file, targetDir) {
    const client = this.client;
    const fileKey = await this.getUniqueFileKey(file.name, 0);
    const stream = fs.createReadStream(file.path);

    utils.log('save -> ', fileKey);

    try {
      const result = await client.putStream(fileKey, stream);

      if (utils.isOk(result)) {
        const {name, url} = result;
        const cname = this.options.endpointCname;

        utils.log('save result -> name: ', name);
        utils.log('save result -> url: ', url);

        return cname ? `${cname}/${name}` : url;
      }

      return Promise.reject(result);
    } catch (error) {
      utils.log('save error -> ', error);
      return Promise.reject(error);
    }
  }

  /**
   * check file exists status
   * @param filename
   * @param targetDir
   * @returns {Promise<boolean|*>}
   */
  async exists(filename, targetDir) {
    try {
      const fileKey = this.getFileKey(filename);
      const result = await this.client.head(fileKey);
      // TODO: md5 check
      utils.log('exists ->', result);

      return utils.isOk(result);
    } catch (e) {
      return false;
    }
  }

  // middleware for serving the files
  serve() {
    // a no-op, these are absolute URLs
    return function(req, res, next) {
      next();
    };
  }

  /**
   * delete file
   * @param fileName
   * @param targetDir
   * @returns {Promise<boolean|*>}
   */
  async delete(fileName, targetDir) {
    try {
      const fileKey = this.getFileKey(fileName);
      let result = await this.client.delete(fileKey);

      utils.log('delete result ->', result);

      return utils.isOk(result);
    } catch (e) {
      utils.log('delete error', e);
      return false;
    }
  }

  /**
   * Reads bytes from Cloud for a target image
   * @param options
   * @returns {Promise<Promise<*|Promise<never>|undefined>|*>}
   */
  async read(options) {
    options = options || {};

    const key = urlParse(options.path).pathname.slice(1);

    try {
      const result = await this.client.get(key);

      if (utils.isOk(result)) {
        return result.content;
      }

      return Promise.reject(result);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  getFileKey(fileName, index) {
    const keyOptions = this.options.fileKey;
    let fileKey = fileName;

    if (keyOptions) {
      const getValue = function(obj) {
        return typeof obj === 'function' ? obj() : obj;
      };
      const ext = path.extname(fileName);
      let basename = path.basename(fileName, ext);
      let prefix = '';
      let suffix = '';
      let extname = '';
      const indexSuffix = index ? `_${index}` : '';

      if (keyOptions.prefix) {
        prefix = moment().format(getValue(keyOptions.prefix))
          .replace(/^\//, '');
      }

      if (keyOptions.suffix) {
        suffix = getValue(keyOptions.suffix);
      }

      if (keyOptions.extname !== false) {
        extname = ext.toLowerCase();
      }

      if (keyOptions.safeString) {
        basename = utils.safeString(basename);
      }

      fileKey = `${prefix}${basename}${suffix}${indexSuffix}${extname}`;
    }

    return fileKey;
  }

  async getUniqueFileKey(fileName, index) {
    let fileKey = this.getFileKey(fileName, index);
    const isExists = await this.exists(fileKey);

    if (isExists) {
      utils.log('exists key ->', fileKey);

      index += 1;
      return this.getUniqueFileKey(fileName, index + 1);
    }

    return fileKey;
  }
}

module.exports = AliCloudStorage;
