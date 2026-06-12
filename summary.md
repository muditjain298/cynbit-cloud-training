# How a Browser Loads a Website

When a user enters a website URL in a browser, the browser first checks its cache for the website data. If the data is not available, it performs a DNS lookup to find the IP address of the server.

After obtaining the IP address, the browser establishes a connection with the web server using TCP and HTTPS protocols. The browser then sends an HTTP request to the server.

The server processes the request and returns the website files such as HTML, CSS, JavaScript, and images. The browser downloads these files and starts rendering the webpage.

Finally, the browser executes JavaScript, applies styles, and displays the fully loaded webpage to the user.

## Key Concepts
- DNS translates domain names into IP addresses.
- IP addresses identify devices on a network.
- Ports help applications communicate.
- HTTP/HTTPS are communication protocols.
- Browsers render web content received from servers.