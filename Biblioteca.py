class Libro:
    def __init__(self, codigo, titulo, autor):
        self.codigo = codigo
        self.titulo = titulo
        self.autor = autor
        self.disponible = True  # al crearlo, está disponible
 
    def __str__(self):
        estado = "Disponible" if self.disponible else "Prestado"
        return f"[{self.codigo}] {self.titulo} - {self.autor} ({estado})"
 
 

# CLASE USUARIO
class Usuario:
    MAX_PRESTAMOS = 3  # un usuario solo puede tener 3 libros a la vez
 
    def __init__(self, cedula, nombre):
        self.cedula = cedula
        self.nombre = nombre
        self.libros_prestados = []  # lista de objetos Libro
 
    def puede_prestar(self):
        return len(self.libros_prestados) < self.MAX_PRESTAMOS
 
    def __str__(self):
        return f"{self.nombre} (CC {self.cedula}) - Libros prestados: {len(self.libros_prestados)}"
 
 

# CLASE BIBLIOTECA
class Biblioteca:
    def __init__(self):
        self.libros = {}     # clave: código del libro, valor: objeto Libro
        self.usuarios = {}   # clave: cédula, valor: objeto Usuario
 
    def agregar_libro(self, codigo, titulo, autor):
        if codigo in self.libros:
            return "Error: ya existe un libro con ese código."
        self.libros[codigo] = Libro(codigo, titulo, autor)
        return "Libro agregado correctamente."
 
    def registrar_usuario(self, cedula, nombre):
        if cedula in self.usuarios:
            return "Error: ya existe un usuario con esa cédula."
        self.usuarios[cedula] = Usuario(cedula, nombre)
        return "Usuario registrado correctamente."
 
    def prestar_libro(self, cedula, codigo):
        # 1. Validar que existan el usuario y el libro
        if cedula not in self.usuarios:
            return "Error: el usuario no existe."
        if codigo not in self.libros:
            return "Error: el libro no existe."
 
        usuario = self.usuarios[cedula]
        libro = self.libros[codigo]
 
        # 2. Validar las reglas del préstamo
        if not libro.disponible:
            return "Error: el libro ya está prestado."
        if not usuario.puede_prestar():
            return "Error: el usuario ya tiene el máximo de libros prestados."
 
        # 3. Hacer el préstamo
        libro.disponible = False
        usuario.libros_prestados.append(libro)
        return f"Préstamo exitoso: '{libro.titulo}' para {usuario.nombre}."
 
    def devolver_libro(self, cedula, codigo):
        if cedula not in self.usuarios:
            return "Error: el usuario no existe."
        if codigo not in self.libros:
            return "Error: el libro no existe."
 
        usuario = self.usuarios[cedula]
        libro = self.libros[codigo]
 
        if libro not in usuario.libros_prestados:
            return "Error: este usuario no tiene ese libro."
 
        libro.disponible = True
        usuario.libros_prestados.remove(libro)
        return f"Devolución exitosa: '{libro.titulo}'."
 
    def listar_libros(self):
        if not self.libros:
            print("No hay libros registrados.")
        for libro in self.libros.values():
            print(libro)
 
    def listar_usuarios(self):
        if not self.usuarios:
            print("No hay usuarios registrados.")
        for usuario in self.usuarios.values():
            print(usuario)
 
# MENÚ PRINCIPAL
def mostrar_menu():
    print("\n===== BIBLIOTECA =====")
    print("1. Agregar libro")
    print("2. Registrar usuario")
    print("3. Prestar libro")
    print("4. Devolver libro")
    print("5. Ver libros")
    print("6. Ver usuarios")
    print("0. Salir")
 
 
def main():
    biblioteca = Biblioteca()
 
    # Datos de ejemplo para probar rápido
    biblioteca.agregar_libro("L1", "Cien años de soledad", "Gabriel García Márquez")
    biblioteca.agregar_libro("L2", "El coronel no tiene quien le escriba", "Gabriel García Márquez")
    biblioteca.registrar_usuario("1001", "Laura")
 
    while True:
        mostrar_menu()
        opcion = input("Elige una opción: ")
 
        if opcion == "1":
            codigo = input("Código del libro: ")
            titulo = input("Título: ")
            autor = input("Autor: ")
            print(biblioteca.agregar_libro(codigo, titulo, autor))
 
        elif opcion == "2":
            cedula = input("Cédula: ")
            nombre = input("Nombre: ")
            print(biblioteca.registrar_usuario(cedula, nombre))
 
        elif opcion == "3":
            cedula = input("Cédula del usuario: ")
            codigo = input("Código del libro: ")
            print(biblioteca.prestar_libro(cedula, codigo))
 
        elif opcion == "4":
            cedula = input("Cédula del usuario: ")
            codigo = input("Código del libro: ")
            print(biblioteca.devolver_libro(cedula, codigo))
 
        elif opcion == "5":
            biblioteca.listar_libros()
 
        elif opcion == "6":
            biblioteca.listar_usuarios()
 
        elif opcion == "0":
            print("¡Hasta pronto!")
            break
 
        else:
            print("Opción no válida, intenta de nuevo.")
 
 
# Esto hace que el programa arranque solo si ejecutas este archivo directamente
if __name__ == "__main__":
    main()