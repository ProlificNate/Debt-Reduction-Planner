// First, add these scripts to your HTML head section
// <script src="https://cdn.jsdelivr.net/npm/aws-amplify@5.0.4/dist/aws-amplify.min.js"></script>

// AWS Amplify Configuration
import { Amplify, Auth } from 'aws-amplify';

Amplify.configure({
    Auth: {
        region: 'us-east-1',
        userPoolId: 'YOUR_USER_POOL_ID',
        userPoolWebClientId: 'YOUR_CLIENT_ID',
        mandatorySignIn: true,
        authenticationFlowType: 'USER_SRP_AUTH'
    }
});

// Handle Registration
async function handleSignUp(email, password, name) {
    try {
        const { user } = await Auth.signUp({
            username: email,
            password: password,
            attributes: {
                email: email,
                name: name
            }
        });
        console.log('Sign up success:', user);
        return {
            success: true,
            message: 'Registration successful! Please check your email for verification code.'
        };
    } catch (error) {
        console.error('Error signing up:', error);
        return {
            success: false,
            message: error.message
        };
    }
}

// Handle Verification
async function confirmSignUp(email, code) {
    try {
        await Auth.confirmSignUp(email, code);
        return {
            success: true,
            message: 'Email verified successfully!'
        };
    } catch (error) {
        console.error('Error confirming sign up:', error);
        return {
            success: false,
            message: error.message
        };
    }
}

// Handle Sign In
async function signIn(email, password) {
    try {
        const user = await Auth.signIn(email, password);
        return {
            success: true,
            user: user
        };
    } catch (error) {
        console.error('Error signing in:', error);
        return {
            success: false,
            message: error.message
        };
    }
}

// Update your registration form handler
document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = this.querySelector('input[type="email"]').value;
    const password = this.querySelector('input[type="password"]').value;
    const name = this.querySelector('input[type="text"]').value;
    
    // Show loading state
    const submitButton = this.querySelector('.submit-btn');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Creating Account...';
    submitButton.disabled = true;
    
    const result = await handleSignUp(email, password, name);
    
    if (result.success) {
        // Show verification form
        const verificationHTML = `
            <div class="form-group">
                <label>Verification Code</label>
                <input type="text" class="form-control" id="verificationCode" required />
                <small>Please check your email for the verification code</small>
            </div>
            <button type="submit" class="submit-btn">Verify Email</button>
        `;
        
        const formContent = this.querySelector('.form-content');
        formContent.innerHTML = verificationHTML;
        
        // Update form submission handler for verification
        this.removeEventListener('submit', arguments.callee);
        this.addEventListener('submit', async function(e) {
            e.preventDefault();
            const code = document.getElementById('verificationCode').value;
            const verificationResult = await confirmSignUp(email, code);
            
            if (verificationResult.success) {
                alert('Account verified successfully! Please log in.');
                // Switch to login form
                document.querySelectorAll('.form-container').forEach(form => {
                    form.style.display = form.style.display === 'none' ? 'block' : 'none';
                });
            } else {
                alert(verificationResult.message);
            }
        });
    } else {
        alert(result.message);
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
    }
});

// Update your login form handler
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = this.querySelector('input[type="email"]').value;
    const password = this.querySelector('input[type="password"]').value;
    
    const submitButton = this.querySelector('.submit-btn');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Logging in...';
    submitButton.disabled = true;
    
    const result = await signIn(email, password);
    
    if (result.success) {
        window.location.href = '/pages/dashboard1.html'; // Redirect to dashboard
    } else {
        alert(result.message);
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
    }
});