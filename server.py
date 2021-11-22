from livereload import Server, shell

server = Server()

# run a shell command
server.watch('./index.html')
server.watch('./proxy.html')
server.watch('./js/*')
server.watch('./css/*')
server.serve(port=35729, host='localhost')