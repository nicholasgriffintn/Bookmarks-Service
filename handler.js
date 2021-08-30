const AWS = require('aws-sdk');
const { config } = require('./config');

const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB();

/* const { graphqlLambda } = require('apollo-server-lambda');
const { makeExecutableSchema } = require('graphql-tools');
const { schema } = require('./schema');
const { resolvers } = require('./resolvers');

const graphQLSchema = makeExecutableSchema({
  typeDefs: schema,
  resolvers,
}); */

module.exports.process = async (event) => {
  if (event.Records && event.Records[0] && event.Records[0].s3) {
    try {
      const bucket = event.Records[0].s3.bucket;
      const object = event.Records[0].s3.object;

      if (!bucket) {
        throw new Error('No bucket object was provided.');
      }
      if (!object) {
        throw new Error('No file object object was provided.');
      }

      const bookmarkBucket = event.Records[0].s3.bucket.name;
      const bookmarkKey = decodeURIComponent(
        event.Records[0].s3.object.key.replace(/\+/g, ' ')
      );

      console.info(`Fetching email at s3://${bookmarkBucket}/${bookmarkKey}`);

      const data = await s3
        .getObject({
          Bucket: bookmarkBucket,
          Key: bookmarkKey,
        })
        .promise();

      if (data) {
        console.info('parsing the bookmark...');

        var fileContents = data.Body.toString();
        var json = JSON.parse(fileContents);

        if (json && json.id) {
          const { id, recieved, subject, from, to, html } = json;

          const fromAddress = from.value[0].address;
          const fromName = from.value[0].name;

          const toAddress = to.value[0].address;
          const toName = to.value[0].name;

          // TODO: parse the html for bookmark data
          const bookmark = {};

          function extractData(data, startStr, endStr) {
            subStrStart = data.indexOf(startStr) + startStr.length;
            return data.substring(
              subStrStart,
              subStrStart + data.substring(subStrStart).indexOf(endStr)
            );
          }

          bookmark.title = extractData(html, '<div>Title: ', '</div>');
          bookmark.description = extractData(
            html,
            '<div>Description: ',
            '</div>'
          );
          bookmark.url = extractData(html, '<div>URL:&nbsp;', '</div>');

          if (
            bookmark &&
            bookmark.title &&
            bookmark.description &&
            bookmark.url
          ) {
            console.info('Storing parsed bookmark...');

            const dataOutput = {
              Item: {
                id: {
                  S: id,
                },
                status: {
                  S: 'unverified',
                },
                recieved: {
                  S: recieved,
                },
                bookmark: {
                  S: JSON.stringify(bookmark),
                },
                subject: {
                  S: subject,
                },
                fromAddress: {
                  S: fromAddress,
                },
                fromName: {
                  S: fromName,
                },
                toAddress: {
                  S: toAddress,
                },
                toName: {
                  S: toName,
                },
              },
            };

            var params = {
              Item: dataOutput.Item,
              TableName: config.tableName,
            };

            const result = await dynamodb.putItem(params).promise();

            if (result) {
              await s3
                .deleteObject({
                  Bucket: bookmarkBucket,
                  Key: bookmarkKey,
                })
                .promise();

              return {
                statusCode: 200,
                body: JSON.stringify({
                  message: result,
                  event,
                }),
              };
            } else {
              throw new Error('No result from dynamoDb');
            }
          } else {
            await s3
              .deleteObject({
                Bucket: bookmarkBucket,
                Key: bookmarkKey,
              })
              .promise();

            throw new Error(
              'Data for bookmark could not be found, this email has been deleted.'
            );
          }
        } else {
          throw new Error('file did not contain expected data.');
        }
      } else {
        throw new Error('No data found.');
      }
    } catch (error) {
      console.error(error);
      throw new Error('Internal server error');
    }
  }

  throw new Error('Incorrect event params!');
};

module.exports.graphql = async (event, context, callback) => {
  /* function callbackWithHeaders(error, output) {
    // eslint-disable-next-line no-param-reassign
    output.headers['Access-Control-Allow-Origin'] = '*';
    callback(error, output);
  }

  const handler = graphqlLambda({ schema: graphQLSchema });
  return handler(event, context, callbackWithHeaders); */
  throw new Error('Internal server error');
};
