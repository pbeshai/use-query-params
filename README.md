<div align="center">
  <h1>useQueryParams</h1>
  <p>A <a href="https://reactjs.org/docs/hooks-intro.html">React Hook</a>, HOC, and Render Props solution for managing state in URL query parameters with easy serialization.
  </p>
  <p>Works with <a href="https://reacttraining.com/react-router/">React Router</a> and <a href="https://reach.tech/router">Reach Router</a> out of the box. TypeScript supported.</p>


  <p>
    <a href="https://www.npmjs.com/package/serialize-query-params"><img alt="npm" src="https://img.shields.io/npm/v/serialize-query-params.svg"></a>
  <a href="https://travis-ci.com/pbeshai/use-query-params/"><img alt="Travis (.com)" src="https://img.shields.io/travis/com/pbeshai/use-query-params.svg"></a>

  </p>

</div>
<hr/>

When creating apps with easily shareable URLs, you often want to encode state as query parameters, but all query parameters must be encoded as strings. `useQueryParams` allows you to easily encode and decode data of any type as query parameters with smart memoization to prevent creating unnecessary duplicate objects. It uses [serialize-query-params](/packages/serialize-query-params/).

## Docs

* [use-query-params docs](/packages/use-query-params/#readme)
* [serialize-query-params docs](/packages/serialize-query-params/#readme)


## Packages

This is a monorepo managed with [Lerna](https://github.com/lerna/lerna). 

| Package                                                       | Version                                                                                                                                   | Docs                                                                                                                                                                                                                                                                          | Description                                                                        |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| [`use-query-params`](/packages/use-query-params)              | [![npm](https://img.shields.io/npm/v/use-query-params.svg?style=flat-square)](https://www.npmjs.com/package/use-query-params)             | [![](https://img.shields.io/badge/API%20Docs-readme-orange.svg?style=flat-square)](/packages/use-query-params/#readme)       | use-query-params React library    |
| [`serialize-query-params`](/packages/serialize-query-params)  | [![npm](https://img.shields.io/npm/v/serialize-query-params.svg?style=flat-square)](https://www.npmjs.com/package/serialize-query-params) | [![](https://img.shields.io/badge/API%20Docs-readme-orange.svg?style=flat-square)](/packages/serialize-query-params/#readme) | serialize-query-params js library |



## Development

To get running locally:

```
npm install
npx lerna bootstrap --hoist --scope "use-query-params" --scope "serialize-query-params"
npm build
npm test
```

Set up examples:

```
lerna bootstrap --scope "*-example"
lerna link
```

Then run one:

```
lerna run --scope react-router-example start
```