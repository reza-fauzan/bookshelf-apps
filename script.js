const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK-APPS';

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('form');
    submitForm.addEventListener('submit', function(event) {
        event.preventDefault();
        addBook();
    });

    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function () {
        searchBooks(searchInput.value.toLowerCase());
    });

    if (isStorageExist()) {
        loadDataFromStorage();
        updateBookCount();
    }
});

document.addEventListener(RENDER_EVENT, function () {
    // console.log(books);
    const uncompleteBOOKList = document.getElementById('books');
    uncompleteBOOKList.innerHTML = '';

    const completeBOOKList = document.getElementById('complete-books');
    completeBOOKList.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isComplete) 
            uncompleteBOOKList.append(bookElement);
        else 
            completeBOOKList.append(bookElement);
    }

    updateBookCount();
});

function addBook() {
    const titleBook = document.getElementById('title').value;
    const authorBook = document.getElementById('author').value;
    const yearBook = document.getElementById('year').value;
    const isComplete = document.getElementById('inputBookIsComplete').checked;

    const generatedID = generatedId();
    const bookObject = generateBookObject(generatedID, titleBook, authorBook, yearBook, isComplete);
    books.push(bookObject);

    alert('Buku Ditambahkan');

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generatedId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
}

function makeBook(bookObject) {
    
    const image = document.createElement('img');
    if(bookObject.isComplete) {
        image.setAttribute('src', 'assets/dibaca.jpg')
    }else {
        image.setAttribute('src', 'assets/belum-dibaca.jpg')
    }

    const imageBook = document.createElement('div');
    imageBook.classList.add('image-book');
    imageBook.append(image);

    const titleBook = document.createElement('h3');
    titleBook.innerText = bookObject.title;

    const authorBook = document.createElement('p');
    authorBook.innerText = bookObject.author;

    const yearBook = document.createElement('p');
    yearBook.innerText = bookObject.year;

    const titleContainer = document.createElement('div');
    titleContainer.classList.add('inner');
    titleContainer.append(titleBook, authorBook, yearBook);
    
    const container = document.createElement('div');
    container.classList.add('item', 'shadow');
    container.append(imageBook, titleContainer);
    container.setAttribute('id', `book-${bookObject.id}`);


    if (bookObject.isComplete) {
        const undoButton = document.createElement('button');
        undoButton.classList.add('undo-button');

        undoButton.addEventListener('click', function () {
            undoTitleFromComplete(bookObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('trash-button');

        trashButton.addEventListener('click', function () {
            removeTitleFromComplete(bookObject.id);
        });

        container.append(undoButton, trashButton);
    }else {
        const checkButton = document.createElement('button');
        checkButton.classList.add('check-button');

        checkButton.addEventListener('click', function () {
            addTitleToComplete(bookObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('trash-button');

        trashButton.addEventListener('click', function () {
            removeTitleFromComplete(bookObject.id);
        });
        
        container.append(checkButton, trashButton);
    }
    return container;
}

function addTitleToComplete (bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }

    return -1;
}

function searchBooks(query) {
    const uncompleteBOOKList = document.getElementById('books');
    uncompleteBOOKList.innerHTML = '';

    const completeBOOKList = document.getElementById('complete-books');
    completeBOOKList.innerHTML = '';

    for (const bookItem of books) {
        if (bookItem.title.toLowerCase().includes(query)) {
            const bookElement = makeBook(bookItem);
            if (!bookItem.isComplete)
                uncompleteBOOKList.append(bookElement);
            else
                completeBOOKList.append(bookElement);
        }
    }
}

function undoTitleFromComplete(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeTitleFromComplete(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === 1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));

    alert('Buku Dihapus');
    saveData();
}

function updateBookCount() {
    const jumlahBukuElement = document.getElementById('jumlahBuku');
    jumlahBukuElement.textContent = books.length;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}