document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    }
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });
  }

  // Hamburger Menu Toggle
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
  }

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

    const rememberCheckbox = form.querySelector('input[name="remember"]');
    if (rememberCheckbox) {
      rememberCheckbox.addEventListener('change', () => {
        console.log('Remember Me changed to:', rememberCheckbox.checked);
      });
    }
  });

  // Handle Signup Form Submission with AJAX
  const signupFormElement = document.getElementById('signupForm');
  if (signupFormElement) {
    signupFormElement.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = signupFormElement.querySelector('#signupSubmitBtn');
      const messageDiv = document.querySelector('.signup-panel .message');
      if (!messageDiv) {
        console.error('Error: .message div not found in signup panel');
        return;
      }

      const formData = {
        username: signupFormElement.querySelector('#signupUsername').value.trim(),
        email: signupFormElement.querySelector('#signupEmail').value.trim(),
        password: signupFormElement.querySelector('#signupPassword').value,
      };

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
      if (!formData.username) {
        messageDiv.textContent = 'Username is required';
        messageDiv.classList.remove('hidden', 'success');
        messageDiv.classList.add('error');
        return;
      }
      if (!emailRegex.test(formData.email)) {
        messageDiv.textContent = 'Please enter a valid email';
        messageDiv.classList.remove('hidden', 'success');
        messageDiv.classList.add('error');
        return;
      }
      if (!passwordRegex.test(formData.password)) {
        messageDiv.textContent = 'Password must be at least 8 characters, with uppercase, lowercase, number, and special character';
        messageDiv.classList.remove('hidden', 'success');
        messageDiv.classList.add('error');
        return;
      }

      submitBtn.disabled = true;
      messageDiv.classList.add('hidden');
      messageDiv.textContent = '';

      try {
        const response = await fetch('/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();
        messageDiv.classList.remove('hidden', 'success', 'error');
        messageDiv.textContent = result.message || 'An error occurred';
        messageDiv.classList.add(result.success ? 'success' : 'error');

        if (result.success && result.token) {
          localStorage.setItem('jwt', result.token);
          setTimeout(() => {
            window.location.href = '/auth/home';
          }, 2000);
        }

        if (result.success) {
          setTimeout(() => {
            messageDiv.classList.add('hidden');
            messageDiv.textContent = '';
            signupFormElement.reset();
            signupFormElement.querySelectorAll('input').forEach(input => {
              input.dispatchEvent(new Event('input'));
            });
          }, 5000);
        }

        messageDiv.addEventListener('click', () => {
          if (!messageDiv.classList.contains('success')) {
            messageDiv.classList.add('hidden');
            messageDiv.textContent = '';
          }
        }, { once: true });
      } catch (error) {
        console.error('Signup fetch error:', error);
        messageDiv.classList.remove('hidden', 'success', 'error');
        messageDiv.textContent = 'Network error occurred';
        messageDiv.classList.add('error');

        messageDiv.addEventListener('click', () => {
          messageDiv.classList.add('hidden');
          messageDiv.textContent = '';
        }, { once: true });
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  // Handle Login Form Submission with AJAX
  const loginFormElement = document.getElementById('loginForm');
  if (loginFormElement) {
    loginFormElement.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = loginFormElement.querySelector('#loginSubmitBtn');
      let messageDiv = document.querySelector('.login-panel .message');
      if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.className = 'message hidden';
        loginFormElement.prepend(messageDiv);
      }

      const formData = {
        email: loginFormElement.querySelector('#loginEmail').value.trim(),
        password: loginFormElement.querySelector('#loginPassword').value,
        remember: loginFormElement.querySelector('#remember').checked,
      };

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        messageDiv.textContent = 'Please enter a valid email';
        messageDiv.classList.remove('hidden', 'success');
        messageDiv.classList.add('error');
        return;
      }
      if (!formData.password) {
        messageDiv.textContent = 'Password is required';
        messageDiv.classList.remove('hidden', 'success');
        messageDiv.classList.add('error');
        return;
      }

      submitBtn.disabled = true;
      messageDiv.classList.add('hidden');
      messageDiv.textContent = '';

      try {
        const response = await fetch('/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();
        messageDiv.classList.remove('hidden', 'success', 'error');
        messageDiv.textContent = result.message || 'An error occurred';
        messageDiv.classList.add(result.success ? 'success' : 'error');

        if (result.success && result.token) {
          localStorage.setItem('jwt', result.token);
          setTimeout(() => {
            window.location.href = '/auth/home';
          }, 2000);
        }

        if (result.success) {
          setTimeout(() => {
            messageDiv.classList.add('hidden');
            messageDiv.textContent = '';
            loginFormElement.reset();
            loginFormElement.querySelectorAll('input').forEach(input => {
              input.dispatchEvent(new Event('input'));
            });
          }, 5000);
        }

        messageDiv.addEventListener('click', () => {
          if (!messageDiv.classList.contains('success')) {
            messageDiv.classList.add('hidden');
            messageDiv.textContent = '';
          }
        }, { once: true });
      } catch (error) {
        console.error('Login fetch error:', error);
        messageDiv.classList.remove('hidden', 'success', 'error');
        messageDiv.textContent = 'Network error occurred';
        messageDiv.classList.add('error');

        messageDiv.addEventListener('click', () => {
          messageDiv.classList.add('hidden');
          messageDiv.textContent = '';
        }, { once: true });
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  // Handle GitHub OAuth Redirect
  const urlParams = new URLSearchParams(window.location.search);
  const error = urlParams.get('error');
  if (error && window.location.pathname === '/auth/login') {
    const messageDiv = document.querySelector('.login-panel .message') || document.createElement('div');
    if (!messageDiv.parentElement) {
      messageDiv.className = 'message error';
      document.querySelector('.login-panel').prepend(messageDiv);
    }
    messageDiv.textContent = error;
    messageDiv.classList.remove('hidden', 'success');
    messageDiv.classList.add('error');
    messageDiv.addEventListener('click', () => {
      messageDiv.classList.add('hidden');
      messageDiv.textContent = '';
    }, { once: true });
    window.history.replaceState({}, document.title, '/auth/login');
  }

  // Toggle Login/Signup
  const formWrapper = document.querySelector('.form-wrapper');
  const toSignupLink = document.getElementById('toSignup');
  const toLoginLink = document.getElementById('toLogin');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const messageDiv = document.querySelector('.signup-panel .message');

  const resetForms = () => {
    if (loginForm) {
      loginForm.reset();
      loginForm.querySelectorAll('input').forEach(input => {
        input.dispatchEvent(new Event('input'));
      });
    }
    if (signupForm) {
      signupForm.reset();
      signupForm.querySelectorAll('input').forEach(input => {
        input.dispatchEvent(new Event('input'));
      });
    }
    if (messageDiv) {
      messageDiv.classList.add('hidden');
      messageDiv.textContent = '';
    }
    const loginMessageDiv = document.querySelector('.login-panel .message');
    if (loginMessageDiv) {
      loginMessageDiv.classList.add('hidden');
      loginMessageDiv.textContent = '';
    }
  };

  if (toSignupLink) {
    toSignupLink.addEventListener('click', (e) => {
      e.preventDefault();
      formWrapper.classList.add('signup-active');
      resetForms();
    });
  }

  if (toLoginLink) {
    toLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      formWrapper.classList.remove('signup-active');
      resetForms();
    });
  }

  // Handle Message Close Buttons
  document.querySelectorAll('.message .close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const messageDiv = btn.closest('.message');
      messageDiv.classList.add('hidden');
      messageDiv.textContent = '';
    });
  });

  // Handle Logout
  const logoutButtons = document.querySelectorAll('.logout-btn, .logout-nav');
  logoutButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      console.log('Logout button clicked');
      try {
        const response = await fetch('/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
          },
        });
        console.log('Logout response status:', response.status);
        const result = await response.json();
        console.log('Logout response JSON:', result);
        if (result.success) {
          localStorage.removeItem('jwt');
          console.log('JWT removed from localStorage');
          window.location.href = '/auth/login?message=Logged out successfully';
        } else {
          console.error('Logout failed:', result.message);
          alert('Logout failed: ' + result.message);
          window.location.href = '/auth/login?error=Logout failed';
        }
      } catch (error) {
        console.error('Logout error:', error);
        localStorage.removeItem('jwt');
        window.location.href = '/auth/login?error=An error occurred during logout';
      }
    });
  });

  // Add Authorization header to all fetch requests
  const originalFetch = window.fetch;
  window.fetch = async (url, options = {}) => {
    const token = localStorage.getItem('jwt');
    if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      };
    }
    return originalFetch(url, options);
  };
});
