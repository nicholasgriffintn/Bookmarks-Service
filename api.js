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
  introspection: false,
});

module.exports.graphql = gqlServer.createHandler({
  cors: {
    origin: true,
    credentials: true,
  },
});
