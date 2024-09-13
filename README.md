<!--![image](https://github.com/user-attachments/assets/ae75fec0-de08-40c8-a32e-0684992f6e2f)-->
<a id="readme-top"></a>


<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]


<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/vinsrep/osis-api">
    <img class="pfp" src="https://github.com/user-attachments/assets/99984be4-26d4-48cc-b514-26ad2359485b" alt="Logo" width="100" height="100">
  </a>

  <h3 align="center">OSIS Attendance Manager API</h3>

  <p align="center">
    Backend API of OSIS Attendance Manager (2024).
    <br />
    <br />
    <a href="https://github.com/vinsrep/osis-api/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    ·
    <a href="https://github.com/vinsrep/osis-api/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

### Built With

* [![Express][Express.js]][Express-url]
* [![Node][Node.js]][Node-url]

# Installation guide
To install the API on your device, follow the guide below:
1. In the command prompt or terminal of your choice, clone the project:
```
git clone https://github.com/vinsrep/osis-api
```
2. Go inside the folder
```
cd osis-api
```
3. Install the dependencies
```
npm install
```

# Setup
To setup the API on your device, follow the guide below:
1. Copy .env.example and rename it to .env
```
cp .env.example .env
```
2. Generate a new JWT key using Node
```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
3. Copy the token and paste it within .env
```
JWT_SECRET=paste-the-generated-string-here
```
4. Start the server
```
npm start server
```

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/vinsrep/osis-api.svg?style=for-the-badge
[contributors-url]: https://github.com/vinsrep/osis-api/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/vinsrep/osis-api.svg?style=for-the-badge
[forks-url]: https://github.com/vinsrep/osis-api/network/members
[stars-shield]: https://img.shields.io/github/stars/vinsrep/osis-api.svg?style=for-the-badge
[stars-url]: https://github.com/vinsrep/osis-api/stargazers
[issues-shield]: https://img.shields.io/github/issues/vinsrep/osis-api.svg?style=for-the-badge
[issues-url]: https://github.com/vinsrep/osis-api/issues
[license-shield]: https://img.shields.io/github/license/vinsrep/osis-api.svg?style=for-the-badge
[license-url]: https://github.com/vinsrep/osis-api/blob/main/LICENSE.txt
[Express.js]: https://img.shields.io/badge/Express.js-%23404d59.svg?logo=express&logoColor=%2361DAFB
[Express-url]: https://expressjs.org/
[Node.js]: https://img.shields.io/badge/Node.js-6DA55F?logo=node.js&logoColor=white
[Node-url]: https://nodejs.org/

<p align="right">(<a href="#readme-top">back to top</a>)</p>
