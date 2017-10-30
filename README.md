# xin-connect

Xin REST connection library

```sh
npm i xin-connect
```

## connect-pool

Connection pool to connect to Web API.

### Properties

- status: Number, (-1=Error, 0=Offline, 1=Connected)
- pingUrl: String
- pingFn: Function
- pingTimeout: Number(3000)
- pingRetry: Number(10000)
- baseUrl: String
- headers: Object

### Methods

- #ping()
- #fetch(url, options)
- #getUrl(url)

### Events

- status-change

## connect-fetch

Fetch single url

### Properties

- pool: Object
- url: String | URL
- value: Object

### Methods

- #execute()
- #fetch()

### Events

- response
- error