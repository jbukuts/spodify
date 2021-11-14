from livereload import Server, shell

server = Server()

# run a shell command
server.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
server.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
server.watch('../')
server.serve(port=35729, host='localhost')