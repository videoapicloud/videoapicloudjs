var videoapicloud = require('./videoapicloud');
var fs = require('fs');

exports.testSubmitConfig = function(test) {
  conf = videoapicloud.config({
    'source': 'https://s3-eu-west-1.amazonaws.com/files.videoapi.cloud/test.mp4',
    'webhook': 'http://mysite.com/webhook',
    'outputs': {'mp4': 's3://a:s@bucket/video.mp4'}
  });

  videoapicloud.submit(conf, null, function(job) {
    test.notEqual(undefined, job);
    test.equal('processing', job.status);
    test.ok(job.id > 0);
    test.done();
  });
};

exports.testSubmitBadConfig = function(test) {
  conf = videoapicloud.config({
    'source': 'https://s3-eu-west-1.amazonaws.com/files.videoapi.cloud/test.mp4'
  });

  videoapicloud.submit(conf, null, function(job) {
    test.notEqual(undefined, job);
    test.equal('error', job.status);
    test.equal('config_not_valid', job.error_code);
    test.done();
  });
};

exports.testSubmitConfigWithAPIKey = function(test) {
  conf = videoapicloud.config({
    'source': 'https://s3-eu-west-1.amazonaws.com/files.videoapi.cloud/test.mp4'
  });

  videoapicloud.submit(conf, 'k-4d204a7fd1fc67fc00e87d3c326d9b75', function(job) {
    test.notEqual(undefined, job);
    test.equal('error', job.status);
    test.equal('authentication_failed', job.error_code);
    test.done();
  });
};

exports.testGenerateFullConfigWithNoFile = function(test) {
  conf = videoapicloud.config({
    'vars': {
      'vid': 1234,
      'user': 5098,
      's3': 's3://a:s@bucket'
    },
    'source': 'https://s3-eu-west-1.amazonaws.com/files.videoapi.cloud/test.mp4',
    'webhook': 'http://mysite.com/webhook?vid=$vid&user=$user',
    'outputs': {
      'mp4': '$s3/vid.mp4',
      'webm': '$s3/vid.webm',
      'jpg_200x': '$s3/thumb.jpg'
    }
  });

  generated = [
    'var s3 = s3://a:s@bucket',
    'var user = 5098',
    'var vid = 1234',
    '',
    'set source = https://s3-eu-west-1.amazonaws.com/files.videoapi.cloud/test.mp4',
    'set webhook = http://mysite.com/webhook?vid=$vid&user=$user',
    '',
    '-> jpg_200x = $s3/thumb.jpg',
    '-> mp4 = $s3/vid.mp4',
    '-> webm = $s3/vid.webm'
  ].join("\n")

  test.equal(generated, conf);
  test.done();
}

exports.testGenerateConfigWithFile = function(test) {
  fs.writeFileSync('videoapicloud.conf', "var s3 = s3://a:s@bucket/video\nset webhook = http://mysite.com/webhook?vid=$vid&user=$user\n-> mp4 = $s3/$vid.mp4");

  conf = videoapicloud.config({
    'conf': 'videoapicloud.conf',
    'source': 'https://s3-eu-west-1.amazonaws.com/files.videoapi.cloud/test.mp4',
    'vars': {'vid': 1234, 'user': 5098}
  });

  generated = [
    'var s3 = s3://a:s@bucket/video',
    'var user = 5098',
    'var vid = 1234',
    '',
    'set source = https://s3-eu-west-1.amazonaws.com/files.videoapi.cloud/test.mp4',
    'set webhook = http://mysite.com/webhook?vid=$vid&user=$user',
    '',
    '-> mp4 = $s3/$vid.mp4'
  ].join("\n")

  test.equal(generated, conf);
  fs.unlinkSync('videoapicloud.conf');
  test.done();
}

exports.testSubmitFile = function(test) {
  fs.writeFileSync('videoapicloud.conf', "set webhook = http://mysite.com/webhook?vid=$vid&user=$user\n-> mp4 = s3://a:s@bucket/video/$vid.mp4");

  videoapicloud.createJob({
    'conf': 'videoapicloud.conf',
    'source': 'https://s3-eu-west-1.amazonaws.com/files.videoapi.cloud/test.mp4',
    'vars': {'vid': 1234, 'user': 5098}
  }, function(job) {
    test.equal('processing', job.status);
    test.ok(job.id > 0);
    fs.unlinkSync('videoapicloud.conf');
    test.done();
  });

}

exports.testGetJobInfo = function(test) {
  conf = videoapicloud.config({
    'source': 'https://s3-eu-west-1.amazonaws.com/files.videoapi.cloud/test.mp4',
    'webhook': 'http://mysite.com/webhook',
    'outputs': {'mp4': 's3://a:s@bucket/video.mp4'}
  });

  videoapicloud.submit(conf, null, function(job) {
    videoapicloud.getJob(job.id, function(info) {
      test.equal(info.id, job.id);
      test.done();
    });

  });
}

exports.testGetAllMetadata = function(test) {
  conf = videoapicloud.config({
    'source': 'https://s3-eu-west-1.amazonaws.com/files.videoapi.cloud/test.mp4',
    'webhook': 'http://mysite.com/webhook',
    'outputs': {'mp4': 's3://a:s@bucket/video.mp4'}
  });

  videoapicloud.submit(conf, null, function(job) {
    setTimeout(function() {
      videoapicloud.getAllMetadata(job.id, function(metadata) {
        test.notEqual(undefined, metadata);
        test.done();
      });

    }, 4000);

  });
}

exports.testGetSourceMetadata = function(test) {
  conf = videoapicloud.config({
    'source': 'https://s3-eu-west-1.amazonaws.com/files.videoapi.cloud/test.mp4',
    'webhook': 'http://mysite.com/webhook',
    'outputs': {'mp4': 's3://a:s@bucket/video.mp4'}
  });

  videoapicloud.submit(conf, null, function(job) {

      setTimeout(function() {
        videoapicloud.getMetadataFor(job.id, 'source', function(metadata) {
          test.notEqual(undefined, metadata);
          test.done();
        });

      }, 4000);

  });
}

exports.testSetApiVersion = function(test) {
  conf = videoapicloud.config({
    'api_version': 'beta',
    'source': 'https://s3-eu-west-1.amazonaws.com/files.videoapi.cloud/test.mp4',
    'webhook': 'http://mysite.com/webhook?vid=$vid&user=$user',
    'outputs': {
      'mp4': '$s3/vid.mp4',
    }
  });

  generated = [
    '',
    'set api_version = beta',
    'set source = https://s3-eu-west-1.amazonaws.com/files.videoapi.cloud/test.mp4',
    'set webhook = http://mysite.com/webhook?vid=$vid&user=$user',
    '',
    '-> mp4 = $s3/vid.mp4',
  ].join("\n")

  test.equal(generated, conf);
  test.done();
}
