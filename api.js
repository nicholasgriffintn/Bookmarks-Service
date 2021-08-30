const { config } = require('./config');

const { ApolloServer, gql } = require('apollo-server-lambda');
const {
  ApolloServerPluginLandingPageGraphQLPlayground,
} = require('apollo-server-core');
const { unmarshall } = require('@aws-sdk/util-dynamodb');
const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({ region: config.region });

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  scalar JSON
  type Bookmark {
    id: String!
    status: String
    subject: String
    recieved: String
    bookmark: String
    toName: String
    toAddress: String
    fromName: String
    fromAddress: String
  }
  type Query {
    bookmarks: [Bookmark]
  }
`;

const getBookmarks = async () => {
  const params = {
    TableName: config.tableName,
  };

  try {
    const results = await client.send(new ScanCommand(params));
    const bookmarks = [];
    results.Items.forEach((item) => {
      const newRecord = unmarshall(item);

      bookmarks.push(newRecord);
    });
    return bookmarks;
  } catch (err) {
    console.error(err);
    return err;
  }
};

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    bookmarks: () => {
      return getBookmarks();
    },
  },
};

const gqlServer = new ApolloServer({
  typeDefs,
  resolvers,

  // By default, the GraphQL Playground interface and GraphQL introspection
  // is disabled in "production" (i.e. when `process.env.NODE_ENV` is `production`).
  //
  // If you'd like to have GraphQL Playground and introspection enabled in production,
  // install the Playground plugin and set the `introspection` option explicitly to `true`.
  introspection: true,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
});

module.exports.graphql = gqlServer.createHandler({
  cors: {
    origin: true,
    credentials: true,
  },
});
