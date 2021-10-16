const { config } = require('./config');

const { ApolloServer, gql } = require('apollo-server-lambda');
const { unmarshall } = require('@aws-sdk/util-dynamodb');
const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({ region: config.region });

const typeDefs = gql`
  scalar JSON
  type Bookmark {
    id: String!
    status: String
    subject: String
    recieved: String
    toName: String
    toAddress: String
    fromName: String
    fromAddress: String
    bookmark: String
    url: String
    title: String
    description: String
    screenshot: String
  }
  type Query {
    bookmarks: [Bookmark]
    unverifiedBookmarks: [Bookmark]
  }
`;

const getBookmarks = async (status = 'verified') => {
  const params = {
    TableName: config.tableName,
    FilterExpression: '#status = :status',
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ExpressionAttributeValues: { ':status': { S: status } },
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

const resolvers = {
  Query: {
    bookmarks: () => {
      return getBookmarks();
    },
    unverifiedBookmarks: () => {
      return getBookmarks('unverified');
    },
  },
  Mutation: {
    update: async (_, data, { dataSources }) => {
      // TODO
    },
    submit: async (_, data, { dataSources }) => {
      // TODO
    },
  },
};

const gqlServer = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: false,
});

module.exports.graphql = gqlServer.createHandler({
  cors: {
    origin: true,
    credentials: true,
  },
});
