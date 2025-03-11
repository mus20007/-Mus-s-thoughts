document.addEventListener('DOMContentLoaded', function () {
    const textEditor = document.getElementById('textEditor');
    const imageUpload = document.getElementById('imageUpload');
    const newTextButton = document.getElementById('newText');
    const textList = document.getElementById('textList');
    const boldButton = document.getElementById('boldButton');
    const underlineButton = document.getElementById('underlineButton');
    const textColorButton = document.getElementById('textColorButton');
    const backgroundColorButton = document.getElementById('backgroundColorButton');
    const setPasswordButton = document.getElementById('setPassword');
    const changePasswordButton = document.getElementById('changePassword');
    let currentTextId = null;
    let thoughtCounter = 1; // Counter for default names

    // Load saved texts and password
    let password = localStorage.getItem('password') || null;
    loadTexts();

    // Create new text (with password protection)
    newTextButton.addEventListener('click', function () {
        if (!password) {
            // If no password is set, allow creating a new text
            createNewText();
            return;
        }

        // Prompt for password
        const enteredPassword = prompt('Enter the password to create a new text:');
        if (enteredPassword === password) {
            createNewText();
        } else {
            alert('Incorrect password.');
        }
    });

    // Function to create a new text
    function createNewText() {
        const name = prompt('Enter a name for this text (or leave blank for default):');
        const textName = name || `Thought ${thoughtCounter++}`; // Use default name if none provided
        currentTextId = Date.now().toString();
        textEditor.innerHTML = '';
        saveText(currentTextId, '', '', textName);
        addTextToList(currentTextId, textName);
    }

    // Save text on input
    textEditor.addEventListener('input', function () {
        if (currentTextId) {
            const textData = JSON.parse(localStorage.getItem('texts')).find(text => text.id === currentTextId);
            saveText(currentTextId, textEditor.innerHTML, '', textData.name);
        }
    });

    // Handle image upload
    imageUpload.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                textEditor.appendChild(img); // Insert image into the text editor
                if (currentTextId) {
                    const textData = JSON.parse(localStorage.getItem('texts')).find(text => text.id === currentTextId);
                    saveText(currentTextId, textEditor.innerHTML, '', textData.name);
                }
            };
            reader.readAsDataURL(file);
        }
    });

    // Bold button
    boldButton.addEventListener('click', function () {
        document.execCommand('bold', false, null); // Apply bold formatting
    });

    // Underline button
    underlineButton.addEventListener('click', function () {
        document.execCommand('underline', false, null); // Apply underline formatting
    });

    // Text Color button
    textColorButton.addEventListener('click', function () {
        showColorPicker('textColor');
    });

    // Background Color button
    backgroundColorButton.addEventListener('click', function () {
        showColorPicker('backgroundColor');
    });

    // Show color picker
    function showColorPicker(type) {
        const existingPicker = document.querySelector('.color-picker');
        if (existingPicker) existingPicker.remove();

        const colorPicker = document.createElement('div');
        colorPicker.className = 'color-picker';

        const colors = ['black', 'white', 'darkblue', 'indigo', 'red', 'yellow', 'darkgreen'];
        colors.forEach(color => {
            const colorOption = document.createElement('div');
            colorOption.className = 'color-option';
            colorOption.style.backgroundColor = color;
            colorOption.addEventListener('click', function () {
                applyColor(type, color);
                colorPicker.remove();
            });
            colorPicker.appendChild(colorOption);
        });

        document.body.appendChild(colorPicker);

        // Position the color picker below the clicked button
        const button = type === 'textColor' ? textColorButton : backgroundColorButton;
        const rect = button.getBoundingClientRect();
        colorPicker.style.position = 'absolute';
        colorPicker.style.left = `${rect.left}px`;
        colorPicker.style.top = `${rect.bottom + 5}px`;
        colorPicker.style.display = 'flex'; // Ensure the color picker is visible

        // Hide color picker on click outside
        document.addEventListener('click', function hidePicker(e) {
            if (!colorPicker.contains(e.target) && e.target !== textColorButton && e.target !== backgroundColorButton) {
                colorPicker.remove();
                document.removeEventListener('click', hidePicker);
            }
        });
    }

    // Apply color to text or background
    function applyColor(type, color) {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
            alert('Please select some text to apply the color.');
            return;
        }

        if (type === 'textColor') {
            document.execCommand('foreColor', false, color); // Apply text color
        } else if (type === 'backgroundColor') {
            document.execCommand('hiliteColor', false, color); // Apply background color
        }
    }

    // Set Password
    setPasswordButton.addEventListener('click', function () {
        if (password) {
            alert('A password is already set. Use "Change Password" to update it.');
            return;
        }
        const newPassword = prompt('Set a new password:');
        if (newPassword) {
            password = newPassword;
            localStorage.setItem('password', password);
            alert('Password set successfully!');
        }
    });

    // Change Password
    changePasswordButton.addEventListener('click', function () {
        if (!password) {
            alert('No password is set. Use "Set Password" to create one.');
            return;
        }
        const oldPassword = prompt('Enter the current password:');
        if (oldPassword !== password) {
            alert('Incorrect password.');
            return;
        }
        const newPassword = prompt('Enter a new password:');
        if (newPassword) {
            password = newPassword;
            localStorage.setItem('password', password);
            alert('Password changed successfully!');
        }
    });

    // Load saved texts into the sidebar
    function loadTexts() {
        const texts = JSON.parse(localStorage.getItem('texts')) || [];
        texts.forEach(text => {
            addTextToList(text.id, text.name);
        });
        // Update thought counter based on existing texts
        thoughtCounter = texts.length + 1;
    }

    // Add text to the sidebar list
    function addTextToList(id, name) {
        const li = document.createElement('li');
        li.textContent = name;
        li.dataset.id = id;

        // Click to load text (with password protection)
        li.addEventListener('click', function () {
            if (!password) {
                // No password set, load text directly
                loadText(id);
                return;
            }
            const enteredPassword = prompt('Enter the password to view this text:');
            if (enteredPassword === password) {
                loadText(id);
            } else {
                alert('Incorrect password.');
            }
        });

        // Right-click to show context menu
        li.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            showContextMenu(e, id);
        });

        // Long-press for mobile
        let pressTimer;
        li.addEventListener('touchstart', function (e) {
            pressTimer = setTimeout(() => {
                showContextMenu(e, id);
            }, 500);
        });

        li.addEventListener('touchend', function () {
            clearTimeout(pressTimer);
        });

        textList.appendChild(li);
    }

    // Load text into the editor
    function loadText(id) {
        currentTextId = id;
        const textData = JSON.parse(localStorage.getItem('texts')).find(text => text.id === id);
        textEditor.innerHTML = textData.content;
    }

    // Show context menu
    function showContextMenu(e, id) {
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) existingMenu.remove();

        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';

        // Change Name option
        const changeNameButton = document.createElement('button');
        changeNameButton.textContent = 'Change Name';
        changeNameButton.addEventListener('click', function () {
            verifyPassword(() => {
                const newName = prompt('Enter a new name for this text:');
                if (newName) {
                    changeTextName(id, newName);
                }
            });
            contextMenu.remove();
        });

        // Delete option
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', function () {
            verifyPassword(() => {
                deleteText(id);
            });
            contextMenu.remove();
        });

        contextMenu.appendChild(changeNameButton);
        contextMenu.appendChild(deleteButton);
        document.body.appendChild(contextMenu);

        // Position the context menu
        const x = e.clientX || e.touches[0].clientX;
        const y = e.clientY || e.touches[0].clientY;
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;

        // Hide context menu on click outside
        document.addEventListener('click', function hideMenu() {
            contextMenu.remove();
            document.removeEventListener('click', hideMenu);
        });
    }

    // Verify password
    function verifyPassword(callback) {
        if (!password) {
            callback();
            return;
        }
        const enteredPassword = prompt('Enter the password:');
        if (enteredPassword === password) {
            callback();
        } else {
            alert('Incorrect password.');
        }
    }

    // Change text name
    function changeTextName(id, newName) {
        let texts = JSON.parse(localStorage.getItem('texts')) || [];
        const textIndex = texts.findIndex(text => text.id === id);
        if (textIndex !== -1) {
            texts[textIndex].name = newName;
            localStorage.setItem('texts', JSON.stringify(texts));

            // Update the name in the sidebar
            const li = document.querySelector(`li[data-id="${id}"]`);
            if (li) li.textContent = newName;
        }
    }

    // Delete text
    function deleteText(id) {
        let texts = JSON.parse(localStorage.getItem('texts')) || [];
        texts = texts.filter(text => text.id !== id);
        localStorage.setItem('texts', JSON.stringify(texts));

        // Remove from sidebar
        const li = document.querySelector(`li[data-id="${id}"]`);
        if (li) li.remove();

        if (currentTextId === id) {
            textEditor.innerHTML = '';
            currentTextId = null;
        }
    }

    // Save text to local storage
    function saveText(id, content, image, name) {
        let texts = JSON.parse(localStorage.getItem('texts')) || [];
        const textIndex = texts.findIndex(text => text.id === id);
        if (textIndex !== -1) {
            texts[textIndex] = { id, content, image, name };
        } else {
            texts.push({ id, content, image, name });
        }
        localStorage.setItem('texts', JSON.stringify(texts));
    }
});
