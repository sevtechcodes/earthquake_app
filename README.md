# Offical Elastic Community - Earthquake App
## Create project on local and run it
- On terminal
``` 
mkdir earthquake_app
cd earthquake_app
npm init -y
npm install @elastic/elasticsearch axios config cors express log-timestamp nodemon
code .
```
- In the project folder, add a folder **server** and inside the folder add a file **server.js**. Write the following code inside:

```javascript
const express = require('express');

const app = express();
const PORT = 3001;

app.get('/', (req, res) => {
  res.send('Earthquake app server running');
});

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
```
 - In the package.json replace **index.js** with **server.js**. Server.js will be our app entry point. Also add this line under the **"Script"** section to run the app automaticly by nodemon when we do any change: 
 ```"start": "nodemon server/server.js"```

## Add your project to Github
In the project directory add a file **.gitignore**
Write inside
```javascript
# Node modules
node_modules/

# Logs
logs/
*.log
npm-debug.log*

# Environment variables
.env

# OS files
.DS_Store
Thumbs.db

# IDE/editor files
.vscode/
.idea/

# Optional: build/output folders
dist/
build/
```

- On the terminal:
```javascript
npm init
git add .
git commit -m 'Initial commit'
git remote add origin https://github.com/username/repository.git
git push -u origin master
```
