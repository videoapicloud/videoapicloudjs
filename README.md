# NodeJS client Library for VideoAPI.cloud

## Install

```console
npm install videoapicloudjs
```

## Submitting the job

Example of `videoapicloud.conf`:

```ini
var s3 = s3://accesskey:secretkey@mybucket

set webhook = http://mysite.com/webhook/videoapicloud?videoId=$vid

-> mp4  = $s3/videos/video_$vid.mp4
-> webm = $s3/videos/video_$vid.webm
-> jpg:300x = $s3/previews/thumbs_#num#.jpg, number=3
```

Here is the javascript code to submit the config file:

```javascript
var videoapicloud = require('videoapicloudjs');

videoapicloud.createJob({
  'api_key': 'k-api-key',
  'conf': 'videoapicloud.conf',
  'source': 'https://s3-eu-west-1.amazonaws.com/videoapi.cloud/test.mp4',
  'vars': {'vid': 1234}
}, function(job) {
  if(job && job.status == 'ok') {
    console.log(job.id);
  } else if (job) {
    console.log(job.error_code);
    console.log(job.error_message);
  } else {
    console.log('Error creating job')
  }
});
```

You can also create a job without a config file. To do that you will need to give every settings in the method parameters. Here is the exact same job but without a config file:

```javascript
var videoapicloud = require('videoapicloudjs');

vid = 1234
s3 = 's3://accesskey:secretkey@mybucket'

videoapicloud.createJob({
  'api_key': 'k-api-key',
  'source': 'http://yoursite.com/media/video.mp4',
  'webhook': 'http://mysite.com/webhook/videoapicloud?videoId=' + vid,
  'outputs': {
    'mp4': s3 + '/videos/video_' + vid + '.mp4',
    'webm': s3 + '/videos/video_' + vid + '.webm',
    'jpg:300x': s3 + '/previews/thumbs_#num#.jpg, number=3'
  }
}, function(job) {
  //...
});
```

Other example usage:

```javascript
// Getting info about a job
job = videoapicloud.getJob(18370773, function(job) {
  //...
});

// Retrieving metadata
videoapicloud.getAllMetadata(18370773, function(metadata) {
  // ...
});

// Retrieving the source file metadata only
videoapicloud.getMetadataFor(18370773, 'source', function(metadata) {
  // ...
});
```

Note that you can use the environment variable `VIDEOAPICLOUD_API_KEY` to set your API key.

*Released under the [MIT license](http://www.opensource.org/licenses/mit-license.php).*

---

* VideoAPI.cloud website: http://videoapi.cloud
* API documentation: http://videoapi.cloud/docs
* Contact: [support@videoapi.cloud](mailto:support@videoapi.cloud)
