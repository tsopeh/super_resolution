# super_resolution

This project heavily relies on: https://github.com/xinntao/Real-ESRGAN/releases/. Please, make sure to check them out.

## Results

Results are located in the `results` directory. If this is the only thing that interests you, and you don't want to clone this whole repository, you are in luck. You can use the following [link](https://minhaskamal.github.io/DownGit/#/home?url=https://github.com/tsopeh/super_resolution/tree/master/results) to download only the results.

## Development prerequisites

In order to contribute to this project make sure that you have installed:

* Unix based operating system with `bash` installed.
* [NodeJS](https://nodejs.org/) (and [NPM](https://www.npmjs.com/)) — We strongly recommend installing _NodeJS_ (and _NPM_) via [Node Version Manager (nvm)](https://github.com/nvm-sh/nvm#installing-and-updating);
* [Yarn](https://yarnpkg.com/) — _Yarn_ can be installed globally via `npm i -g yarn`;
* [Python](https://www.python.org/) 3.9 or higher;
    * Please make sure that you have `python3` as exported system variable. You can check this using `python3 --version`;

## Development

This repository contains code for both client and server logic:

- Client is implemented using [ReactJS](https://reactjs.org/docs/getting-started.html)
- Server is implemented using [Express](https://expressjs.com/)

Both of these subprojects are written in [Typescript](https://www.typescriptlang.org/).

### Server

You can use the following command to start the _server_ in dev mode:

```shell
yarn start
```

### Client

You can use the following command to start the _client_ in dev mode:

```shell
yarn start
```
