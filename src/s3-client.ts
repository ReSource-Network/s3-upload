import {
  S3Client,
  ListBucketsCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import type { Provider, Credentials } from '@aws-sdk/types';
import type { Readable } from 'stream';
import * as core from '@actions/core';
import * as mime from 'mime-types';

/**
 * Represents an abstraction class for `S3Client` which handles uploading
 * parts to S3.
 */
export default class S3 {
  private client: S3Client

  constructor(
    private accessKey: string,
    private secretKey: string,
    private bucket: string,
    private region: string = 'us-east-1',
    private endpoint: string = ''
  ) {
    this.client = this.createS3Client();
  }

  /**
   * Creates the S3 client
   */
  private createS3Client() {
    core.info('Creating S3 client...');

    // I wish I didn't have to do this, but it's what I got to do
    const defaultCredentialsProvider = (): Provider<Credentials> => () =>
      Promise.resolve({
        secretAccessKey: this.secretKey,
        accessKeyId: this.accessKey,
      });

    const endpointOverride = this.endpoint;

    core.debug(
      `Created S3 client${endpointOverride !== '' ? ', with Wasabi!' : '.'}`
    );

    return new S3Client({
      credentialDefaultProvider: defaultCredentialsProvider,
      endpoint: endpointOverride,
      region: this.region,
    });
  }

  async verifyBucket() {
    core.info(`Verifying bucket ${this.bucket}...`);

    const result = await this.client.send(new ListBucketsCommand({}));
    if (result.Buckets === undefined)
      throw new TypeError(
        "Malformed data from S3 didn't provide buckets (or you didn't create any)"
      );

    const hasBucket = result.Buckets.find(
      (bucket) => bucket.Name !== undefined && bucket.Name === this.bucket
    );
    if (!hasBucket)
      throw new TypeError(
        `Bucket "${this.bucket}" was not found. Did you provide the right region?`
      );
  }

  async upload(
    objectName: string,
    stream: Readable,
    acl: string = 'public-read'
  ) {
    core.info(`Uploading object "${objectName}"...`);

    await this.client.send(
      new PutObjectCommand({
        ContentType: mime.lookup(objectName) || 'application/octet-stream',
        Bucket: this.bucket,
        Body: stream,
        Key: objectName,
        ACL: acl,
      })
    );

    core.info(
      `Uploaded object "${objectName}" (Content-Type: ${
        mime.lookup(objectName) ||
        'application/octet-stream (will download instead of preview)'
      })`
    );
  }
}
