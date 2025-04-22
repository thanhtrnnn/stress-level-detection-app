document.addEventListener('DOMContentLoaded', function() {
    const formFields = document.querySelectorAll('.form-field');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const submitButton = document.getElementById('submitButton');
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.getElementById('progressText');
    const navDotsContainer = document.querySelector('.nav-dots');
    let completedFields = new Set();
    let currentField = 0;
    
    // Initialize form
    createNavDots();
    showField(currentField);
    updateProgress();
    setupKeyboardNavigation();
    initRadioButtons();
    
    // Initialize radio button styling
    function initRadioButtons() {
        const radioContainers = document.querySelectorAll('.radio-container');
        
        radioContainers.forEach(container => {
            container.addEventListener('click', function(e) {
                // Don't re-trigger if clicking the radio input itself
                if (e.target.type !== 'radio') {
                    // Find the radio input inside this container and check it
                    const radio = this.querySelector('input[type="radio"]');
                    radio.checked = true;
                    
                    // Update styling for all containers in this group
                    const name = radio.getAttribute('name');
                    const groupContainers = document.querySelectorAll(`.radio-container input[name="${name}"]`).forEach(input => {
                        const parentContainer = input.closest('.radio-container');
                        if (input.checked) {
                            parentContainer.style.borderColor = '#0056b3';
                            parentContainer.style.backgroundColor = 'rgba(0, 86, 179, 0.05)';
                        } else {
                            parentContainer.style.borderColor = '#e0e0e0';
                            parentContainer.style.backgroundColor = '';
                        }
                    });
                    
                    // Hide validation message when a choice is selected
                    const validationMessage = container.parentNode.nextElementSibling;
                    if (validationMessage && validationMessage.classList.contains('validation-message')) {
                        validationMessage.style.display = 'none';
                    }
                }
            });
        });
        
        // Add change event listener for actual radio inputs
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', function() {
                // Update styling for container
                const container = this.closest('.radio-container');
                if (container) {
                    if (this.checked) {
                        container.style.borderColor = '#0056b3';
                        container.style.backgroundColor = 'rgba(0, 86, 179, 0.05)';
                    } else {
                        container.style.borderColor = '#e0e0e0';
                        container.style.backgroundColor = '';
                    }
                }
            });
        });
    }
    
    // Create navigation dots (skip welcome field at index 0)
    function createNavDots() {
        if (navDotsContainer) {
            navDotsContainer.innerHTML = '';
            // Skip the first field (welcome)
            for (let index = 1; index < formFields.length; index++) {
                const dot = document.createElement('div');
                dot.className = 'nav-dot';
                dot.setAttribute('data-index', index);
                dot.addEventListener('click', () => {
                    // Only allow navigating to completed fields or the next field
                    if (completedFields.has(index) || index === currentField + 1 || index === currentField) {
                        navigateToField(index);
                    }
                });
                navDotsContainer.appendChild(dot);
            }
        }
    }
    
    // Update the navigation dots (skip welcome field at index 0)
    function updateNavDots() {
        if (navDotsContainer) {
            const dots = navDotsContainer.querySelectorAll('.nav-dot');
            // Dots correspond to formFields[1..]
            dots.forEach((dot, i) => {
                const fieldIndex = i + 1;
                dot.classList.remove('active', 'completed');
                if (fieldIndex === currentField) {
                    dot.classList.add('active');
                } else if (completedFields.has(fieldIndex)) {
                    dot.classList.add('completed');
                }
            });
        }
    }
    
    // Set up keyboard navigation (jQuery version for form submit)
    function setupKeyboardNavigation() {
        $(document).on('keydown', function(event) {
            // Only handle keyboard navigation if not typing in an input
            if ($(document.activeElement).is('input, select')) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    if (validateCurrentField()) {
                        if (currentField === formFields.length - 1) {
                            $('#assessmentForm').submit();
                        } else {
                            goToNextField();
                        }
                    }
                }
                return;
            }
            switch (event.key) {
                case 'ArrowDown':
                case 'Enter':
                    event.preventDefault();
                    if (validateCurrentField()) {
                        if (currentField === formFields.length - 1) {
                            $('#assessmentForm').submit();
                        } else {
                            goToNextField();
                        }
                    }
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    goToPrevField();
                    break;
            }
        });
    }
    
    // Event listeners for navigation buttons
    if (prevButton) {
        prevButton.addEventListener('click', function() {
            goToPrevField();
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            if (validateCurrentField()) {
                goToNextField();
            }
        });
    }
    
    // Navigate to previous field
    function goToPrevField() {
        if (currentField > 0) {
            navigateToField(currentField - 1);
        }
    }
    
    // Navigate to next field
    function goToNextField() {
        if (currentField < formFields.length - 1) {
            // Mark current field as completed
            completedFields.add(currentField);
            navigateToField(currentField + 1);
        }
    }
    
    // Navigate to specific field
    function navigateToField(index) {
        if (index >= 0 && index < formFields.length) {
            // Add animation classes for transition effect
            if (index > currentField) {
                formFields[currentField].classList.add('slide-left');
            } else {
                formFields[currentField].classList.add('slide-right');
            }
            
            // Wait for animation to complete before showing the new field
            setTimeout(() => {
                currentField = index;
                showField(currentField);
                updateProgress();
                updateNavDots();
            }, 200);
        }
    }
    
    // Handle form submission
    const form = document.getElementById('assessmentForm');
    if (form) {
        form.addEventListener('submit', function(event) {
            if (!validateAllFields()) {
                event.preventDefault();
                alert('Please complete all required fields correctly.');
            }
        });
    }
    
    // Function to show a specific form field
    function showField(index) {
        formFields.forEach((field, i) => {
            field.classList.remove('active', 'slide-left', 'slide-right');
            if (i === index) {
                field.classList.add('active');
                // If first time seeing this field and all previous are complete, mark as seen
                if (index > 0 && Array.from({length: index}, (_, i) => i).every(i => completedFields.has(i))) {
                    field.classList.add('seen');
                }
                // Add input event listeners to hide validation messages on input/change
                const inputs = field.querySelectorAll('input, select');
                inputs.forEach(input => {
                    if (input.type !== 'radio') {
                        input.addEventListener('input', function() {
                            input.classList.remove('is-invalid');
                            const validationMessage = input.nextElementSibling;
                            if (validationMessage && validationMessage.classList.contains('validation-message')) {
                                validationMessage.style.display = 'none';
                            }
                        });
                    }
                });
            }
        });
        
        // Update button visibility
        if (prevButton) {
            prevButton.style.display = index === 0 ? 'none' : 'flex';
        }
        
        if (nextButton && submitButton) {
            if (index === formFields.length - 1) {
                nextButton.style.display = 'none';
                submitButton.style.display = 'flex';
            } else {
                nextButton.style.display = 'flex';
                submitButton.style.display = 'none';
            }
        }
        
        // Auto-focus on the first input/select in the field (except radio buttons)
        const firstInput = formFields[index].querySelector('input:not([type="radio"]), select');
        if (firstInput) {
            setTimeout(() => {
                firstInput.focus();
            }, 300);
        }

        // Update shortcut text to 'Submit' on last field, 'Continue' otherwise (jQuery version)
        if ($('.shortcut').length) {
            if (index === formFields.length - 1) {
                $('.shortcut').html('<span class="shortcut-key">Enter</span> Submit');
            } else {
                $('.shortcut').html('<span class="shortcut-key">Enter</span> Continue');
            }
        }
    }
    
    // Function to update progress bar and text
    function updateProgress() {
        if (progressFill) {
            const progress = (currentField / (formFields.length - 1)) * 100;
            progressFill.style.width = `${progress}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${currentField}/${formFields.length - 1}`;
        }
    }
    
    // Validation function for the current field
    function validateCurrentField() {
        if (!formFields[currentField]) return true;
        
        const inputs = formFields[currentField].querySelectorAll('input, select');
        let valid = true;
        
        // Special handling for radio button groups
        const radioGroups = {};
        
        inputs.forEach(input => {
            // Remove any existing validation classes
            input.classList.remove('is-invalid');
            
            // Group radio buttons by name
            if (input.type === 'radio') {
                if (!radioGroups[input.name]) {
                    radioGroups[input.name] = [];
                }
                radioGroups[input.name].push(input);
                return;
            }
            
            // Check required fields
            if (input.hasAttribute('required') && !input.value) {
                valid = false;
                input.classList.add('is-invalid');
                
                // Show specific validation message for empty required fields
                const validationMessage = input.nextElementSibling;
                if (validationMessage && validationMessage.classList.contains('validation-message')) {
                    validationMessage.textContent = 'This field is required';
                    validationMessage.style.display = 'block';
                }
            }
            
            // Additional validation for number inputs
            if (input.type === 'number') {
                const min = input.getAttribute('min');
                const max = input.getAttribute('max');
                
                if (min && parseFloat(input.value) < parseFloat(min)) {
                    valid = false;
                    input.classList.add('is-invalid');
                    
                    // Show specific validation message for min value
                    const validationMessage = input.nextElementSibling;
                    if (validationMessage && validationMessage.classList.contains('validation-message')) {
                        validationMessage.textContent = `Value must be at least ${min}`;
                        validationMessage.style.display = 'block';
                    }
                }
                
                if (max && parseFloat(input.value) > parseFloat(max)) {
                    valid = false;
                    input.classList.add('is-invalid');
                    
                    // Show specific validation message for max value
                    const validationMessage = input.nextElementSibling;
                    if (validationMessage && validationMessage.classList.contains('validation-message')) {
                        validationMessage.textContent = `Value must not exceed ${max}`;
                        validationMessage.style.display = 'block';
                    }
                }
            }
        });
        
        // Validate radio groups
        for (const name in radioGroups) {
            const group = radioGroups[name];
            if (group[0].hasAttribute('required')) {
                const isChecked = group.some(radio => radio.checked);
                if (!isChecked) {
                    valid = false;
                    // Find the validation message for this group
                    const radioGroup = group[0].closest('.radio-group');
                    if (radioGroup) {
                        const validationMessage = radioGroup.nextElementSibling;
                        if (validationMessage && validationMessage.classList.contains('validation-message')) {
                            validationMessage.textContent = 'Please select an option';
                            validationMessage.style.display = 'block';
                        }
                    }
                }
            }
        }
        
        return valid;
    }

    function updateRangeValue() {
        // Update sleep quality value display
        $('#e').on('input', function() {
            $('.sleep-quality strong').text($(this).val());
        });
        
        // Update sleep duration value display
        $('#f').on('input', function() {
            $('.sleep-duration strong').text($(this).val());
        });
    }

    // Update range value on input change
    updateRangeValue();
    
    // Validation function for all fields
    function validateAllFields() {
        let valid = true;
        
        formFields.forEach((field, index) => {
            const currentValid = validateField(field);
            if (!currentValid) {
                valid = false;
                // Go back to the first invalid field
                if (index !== currentField) {
                    currentField = index;
                    showField(currentField);
                    updateProgress();
                    updateNavDots();
                }
                return false; // Break the loop
            }
        });
        
        return valid;
    }
    
    // Function to validate a specific field
    function validateField(field) {
        const inputs = field.querySelectorAll('input, select');
        let valid = true;
        
        // Special handling for radio button groups
        const radioGroups = {};
        
        inputs.forEach(input => {
            // Remove any existing validation classes
            input.classList.remove('is-invalid');
            
            // Group radio buttons by name
            if (input.type === 'radio') {
                if (!radioGroups[input.name]) {
                    radioGroups[input.name] = [];
                }
                radioGroups[input.name].push(input);
                return;
            }
            
            // Check required fields
            if (input.hasAttribute('required') && !input.value) {
                valid = false;
                input.classList.add('is-invalid');
            }
            
            // Additional validation for number inputs
            if (input.type === 'number') {
                const min = input.getAttribute('min');
                const max = input.getAttribute('max');
                
                if (min && parseFloat(input.value) < parseFloat(min)) {
                    valid = false;
                    input.classList.add('is-invalid');
                }
                
                if (max && parseFloat(input.value) > parseFloat(max)) {
                    valid = false;
                    input.classList.add('is-invalid');
                }
            }
        });
        
        // Validate radio groups
        for (const name in radioGroups) {
            const group = radioGroups[name];
            if (group[0].hasAttribute('required')) {
                const isChecked = group.some(radio => radio.checked);
                if (!isChecked) {
                    valid = false;
                }
            }
        }
        
        // If field is valid, add it to completed fields
        if (valid) {
            completedFields.add(Array.from(formFields).indexOf(field));
        }
        
        return valid;
    }
    
    // Mouse wheel navigation
    $('.form-container').on('wheel mousewheel DOMMouseScroll', function(event) {
        // Prevent the default page scroll behavior when scrolling over the form
        event.preventDefault(); 

        // Access the original event for deltaY
        const originalEvent = event.originalEvent;
        const delta = originalEvent.deltaY || originalEvent.detail || originalEvent.wheelDelta; // Normalize deltaY

        // Debounce wheel events to prevent too many transitions
        // 'this' refers to the DOM element here, so the timeout property works
        if (this.wheelTimeout) return;
        
        this.wheelTimeout = setTimeout(() => {
            this.wheelTimeout = null;
        }, 500); // Reduced debounce time slightly for responsiveness
        
        
        if (delta > 0) {
            // Scroll down - go to next field
            if (validateCurrentField()) 
                goToNextField();
        } else if (delta < 0) { // Check for actual upward scroll
            // Scroll up - go to previous field
            goToPrevField();
        }
    });

    // BMI Info Card functionality
    setupBmiInfoCard();
    
    function setupBmiInfoCard() {
        const bmiInfoTerm = document.getElementById('bmi-info-term');
        const bmiInfoCard = document.getElementById('bmi-info-card');
        const closeButton = bmiInfoCard.querySelector('.info-card-close');
        
        // Show BMI info card when clicking on the BMI term
        if (bmiInfoTerm) {
            bmiInfoTerm.addEventListener('click', function(e) {
                e.stopPropagation();
                bmiInfoCard.classList.add('active');
            });
        }
        
        // Close info card when clicking the close button
        if (closeButton) {
            closeButton.addEventListener('click', function(e) {
                e.stopPropagation();
                bmiInfoCard.classList.remove('active');
            });
        }
        
        // Close info card when clicking elsewhere on the page
        document.addEventListener('click', function(e) {
            if (bmiInfoCard && !bmiInfoCard.contains(e.target) && e.target !== bmiInfoTerm) {
                bmiInfoCard.classList.remove('active');
            }
        });
    }
});