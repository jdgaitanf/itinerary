// Nodo para la lista enlazada
class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

// Lista Enlazada Simple
class LinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
  }

  // Agregar al final
  append(data) {
    const newNode = new Node(data);

    if (this.head === null) {
      this.head = newNode;
    } else {
      let current = this.head;
      while (current.next !== null) {
        current = current.next;
      }
      current.next = newNode;
    }
    this.size++;
  }

  // Agregar al inicio
  prepend(data) {
    const newNode = new Node(data);
    newNode.next = this.head;
    this.head = newNode;
    this.size++;
  }

  // Insertar en posición específica
  insertAt(data, index) {
    if (index < 0 || index > this.size) {
      return false;
    }

    const newNode = new Node(data);

    if (index === 0) {
      newNode.next = this.head;
      this.head = newNode;
    } else {
      let current = this.head;
      let previous = null;
      let count = 0;

      while (count < index) {
        previous = current;
        current = current.next;
        count++;
      }

      newNode.next = current;
      previous.next = newNode;
    }

    this.size++;
    return true;
  }

  // Eliminar por valor
  remove(data) {
    if (this.head === null) return false;

    if (this.head.data === data) {
      this.head = this.head.next;
      this.size--;
      return true;
    }

    let current = this.head;
    let previous = null;

    while (current !== null && current.data !== data) {
      previous = current;
      current = current.next;
    }

    if (current === null) return false;

    previous.next = current.next;
    this.size--;
    return true;
  }

  // Buscar elemento
  find(data) {
    let current = this.head;
    let index = 0;

    while (current !== null) {
      if (current.data === data) {
        return index;
      }
      current = current.next;
      index++;
    }

    return -1;
  }

  // Convertir a array
  toArray() {
    const result = [];
    let current = this.head;

    while (current !== null) {
      result.push(current.data);
      current = current.next;
    }

    return result;
  }

  // Obtener tamaño
  getSize() {
    return this.size;
  }

  // Verificar si está vacía
  isEmpty() {
    return this.size === 0;
  }
}

export default LinkedList;
