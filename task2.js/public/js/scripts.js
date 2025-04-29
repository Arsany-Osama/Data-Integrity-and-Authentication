document.addEventListener('DOMContentLoaded', () => {
  // Form Validation
  const forms = document.querySelectorAll('#loginForm, #signupForm');
  forms.forEach(form => {
    const submitBtn = form.querySelector('button[type="submit"]');
    const inputs = form.querySelectorAll('input[required]');

    const checkInputs = () => {
      const allFilled = Array.from(inputs).every(input => input.value.trim() !== '');
      submitBtn.disabled = !allFilled;
    };

    inputs.forEach(input => {
      input.addEventListener('input', checkInputs);
    });

    checkInputs();

    // Checkbox Debugging
    const rememberCheckbox = form.querySelector('input[name="remember"]');
    if (rememberCheckbox) {
      rememberCheckbox.addEventListener('change', () => {
        console.log('Remember Me changed to:', rememberCheckbox.checked);
      });
      rememberCheckbox.addEventListener('click', (e) => {
        console.log('Remember Me clicked, new state:', rememberCheckbox.checked);
      });
    }
  });

  // Toggle Login/Signup
  const formWrapper = document.querySelector('.form-wrapper');
  const toSignupLink = document.getElementById('toSignup');
  const toLoginLink = document.getElementById('toLogin');

  if (toSignupLink) {
    toSignupLink.addEventListener('click', (e) => {
      e.preventDefault();
      formWrapper.classList.add('signup-active');
    });
  }

  if (toLoginLink) {
    toLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      formWrapper.classList.remove('signup-active');
    });
  }
});
