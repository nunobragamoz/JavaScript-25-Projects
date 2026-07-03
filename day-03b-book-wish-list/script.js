const bookInput = document.getElementById('bookInput');
const addBtn = document.getElementById('addBtn');
const counter = document.getElementById('counter');
const wishlist = document.getElementById('wishlist');
const sortBtn = document.getElementById('sortBtn');
const clearBtn = document.getElementById('clearBtn');

const books = [];

function addBook() {

    const bookTitle = bookInput.value.trim();

    if (!bookTitle) return;

    books.push({title: bookTitle, read: false});
    bookInput.value = '';
    render();
}

addBtn.addEventListener('click', addBook);

wishlist.addEventListener('click', function(event) {
  
  const button = event.target;

  
  if (!button.matches('button[data-action]')) return;

  
  const action = button.dataset.action;   
  const index = Number(button.dataset.index);


  if (action === 'remove') {
    
    books.splice(index, 1);

  } else if (action === 'toggle') {
    
    books[index].read = !books[index].read;
  }

  
  render();

});

function render() {

    wishlist.innerHTML = '';

    let readCount = 0;

    for(const book of books) {
        if(book.read === true) {
            readCount++;
        }
    }

    for (let i = 0; i < books.length; i++) {
        const book = books[i];
        const readClass = book.read ? 'text-decoration-line-through' : '';
        wishlist.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span class="${readClass}">${book.title}</span>
                <button class="btn btn-sm btn-outline-danger" data-action="remove" data-index="${i}">Remove</button>
                <button class="btn btn-sm btn-outline-success" data-action="toggle" data-index="${i}">Read</button>
            </li>`;
    }

    counter.textContent = `Books in wishlist: ${books.length} | Read: ${readCount}`;
}

function sortBooks() {
    
  books.sort((a, b) => a.title.localeCompare(b.title));
  render();
}

sortBtn.addEventListener('click', sortBooks);

function clearBooks() {

  books.length = 0;
  render();
}

clearBtn.addEventListener('click', clearBooks);





