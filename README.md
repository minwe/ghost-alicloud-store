# Ghost AliCloud OSS Storage

This [Ghost custom storage module](https://ghost.org/docs/concepts/storage-adapters/) allows you to store media file at [AlibabaCloud OSS](https://www.alibabacloud.com) instead of storing at local machine. It requires Ghost greater than `2.x`!

## Installation

### Via NPM

- Install AliCloud storage module

  ```
  npm install ghost-alicloud-store
  ```
- Make the storage folder if it doesn't exist yet

  ```
  mkdir content/adapters/storage
  ```
- Copy the module into the right location

  ```
  cp -vR node_modules/ghost-alicloud-store content/adapters/storage/alicloud-store
  ```
  
  Or create a file named `alicloud-store.js` with below content:
  
  ```
  //  content/adapters/storage/alicloud-store.js
  module.exports = require('ghost-alicloud-store');
  ```

### Via Git

In order to replace the storage module, the basic requirements are:

- Create a new folder inside `/content/adapters` called `/storage`

- Clone this repo to `/storage`

  ```
  cd [path/to/ghost]/content/adapters/storage
  git clone https://github.com/Minwe/ghost-alicloud-store.git alicloud-store
  ```

- Install dependencies

  ```
  cd alicloud-store
  npm install
  ```

## Configuration

In your `config.[env].json` file, you'll need to add a new `storage` block to whichever environment you want to change:

```javascript
storage: {
  active: 'alicloud-store',
  'alicloud-store': {
    // see @https://help.aliyun.com/document_detail/64097.html
    accessKeyId: 'your access key',
    accessKeySecret: 'your access secret',
    bucket: 'your bucket name',
    region: 'oss-cn-hangzhou',
    endpoint: "",
    cname: "",

    // file storage key config [optional]
    fileKey: {
      safeString: true, // use Ghost safaString util to rename filename, e.g. Chinese to Pinyin
      prefix: 'YYYY/MM/', // {String} will be formated by moment.js, using `[]` to escape,
      suffix: '', // {String} string added before file extname.
      extname: true // keep file's extname
    }
    // take `外面的世界 x.jpg` as example,
    // applied above options, you will get an URL like below after uploaded:
    //  http://${bucket}.${origin}.aliyuncs.com/2016/06/wai-mian-de-shi-jie-x.jpg
  }
}
```

## License

Read [LICENSE](LICENSE)
