# HexaChat 1.0
:zap: Light and fast web-chat using Node.JS [WIP]

**NB**: This is a WIP project, a loooooot of functionnality are actually not available, star the project if you want to get an alert when I'm updating it !

# Requirements

In order to install this chat to your server, you have to do some easy stuff.
First, install **node.js** and **npm** if you didn't.
Go into the folder where you want to install the chat.

All dependencies are included in the repository.
* **express**
* **socket.io**
* **colour**

Now you can just clone the repo, you will have a public folder with the following 3 files:
* **client.js**
* **index.html**
* **style.css**

And in the at the root of your folder:
* **client.js**
* **package.json** (check the line **dependencies**, if there is nothing, you have to add manually the two dependencies, express & socket.io)
* and the **node_modules** folder where the node package are installed (automatically)

Finally, it should look like this:

:file_folder: **node_modules**

:open_file_folder: **public**

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**client.js**

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**index.html**

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**style.css**

**server.js**

Now, in order to launch the chat, you have to type **node server**.
Actually, the setup in **server.js** say that you can access to the chat with the 3000 port, like this **your_server_url:3000**.

It's done ! You can chat now ! :D
