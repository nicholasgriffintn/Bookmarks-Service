# Serverless GraphQL Bookmarks Service

This is a Serverless service that will process the bookmark emails from my Inbox Service (https://github.com/nicholasgriffintn/Serverless-Email-Inbox) and store that processed data within DynamoDB.

Alongside that, this service also offers up a GraphQL API that will allow me to retrieve the processed data from my personal site for displaying within the page.

I will also hook up mutations so that Bookmarks can be verified from my Cognito user's account.

You can find the full details for this service here:

Part 1:
https://nicholasgriffin.dev/blog/28d0d116-9f52-4ac2-bb64-d94f0da5c948

Part 2:
https://nicholasgriffin.dev/blog/5dd68d54-9dc4-4dc5-9c74-cae872971b17

Part 3:
(Coming Soon)

## Example Query

```json
query {
  bookmarks {
    id,
    status
    subject
    recieved
    bookmark
    toName
    toAddress
    fromName
    fromAddress
  }
}
```

## Example Response

```json
{
  "data": {
    "bookmarks": [
      {
        "id": "dp1ed5ucq5vmc12elua2gok2ld50q51hu3050rg1",
        "status": "unverified",
        "subject": "React query as a state manager",
        "recieved": "2021-08-30T12:00:30.000Z",
        "bookmark": "{\"title\":\"React Query as a State Manager\",\"description\":\"This is an awesome article about how React Query can be used as a State Manager.\",\"url\":\"<a href=\\\"https://t.co/EtlOk5A5Yn\\\">https://t.co/EtlOk5A5Yn<caret></caret></a>\"}",
        "toName": "",
        "toAddress": "bookmarks@nicholasgriffin.dev",
        "fromName": "Nicholas Griffin",
        "fromAddress": "me@nicholasgriffin.co.uk"
      }
    ]
  }
}
```
