class Auth {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('cloudDriveUsers')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.checkAuth();
    }
    
    bindEvents() {
        try {
            // 登录按钮事件
            const loginBtn = document.getElementById('login-btn');
            if (loginBtn) {
                loginBtn.addEventListener('click', () => {
                    this.login();
                });
            }
            
            // 注册按钮事件
            const registerBtn = document.getElementById('register-btn');
            if (registerBtn) {
                registerBtn.addEventListener('click', () => {
                    this.showRegisterPage();
                });
            }
            
            // 退出登录按钮事件
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    this.logout();
                });
            }
            
            // 注册提交按钮事件
            const registerSubmitBtn = document.getElementById('register-submit-btn');
            if (registerSubmitBtn) {
                registerSubmitBtn.addEventListener('click', () => {
                    this.register();
                });
            }
            
            // 返回登录按钮事件
            const backToLoginBtn = document.getElementById('back-to-login');
            if (backToLoginBtn) {
                backToLoginBtn.addEventListener('click', () => {
                    this.showLoginPage();
                });
            }
            
            // 确保输入框可以正常获取焦点
            const inputs = document.querySelectorAll('input');
            inputs.forEach(input => {
                input.addEventListener('focus', () => {
                    console.log('Input focused:', input.id);
                });
                input.addEventListener('input', () => {
                    console.log('Input changed:', input.id, input.value);
                });
            });
        } catch (error) {
            console.error('Error binding events:', error);
        }
    }
    
    checkAuth() {
        if (this.currentUser) {
            this.showCloudDrive();
        } else {
            this.showLoginPage();
        }
    }
    
    showLoginPage() {
        try {
            const loginPage = document.getElementById('loginPage');
            if (loginPage) {
                loginPage.style.display = 'flex';
            }
            
            const registerPage = document.getElementById('registerPage');
            if (registerPage) {
                registerPage.style.display = 'none';
            }
            
            const cloudDrive = document.getElementById('cloudDrive');
            if (cloudDrive) {
                cloudDrive.style.display = 'none';
            }
        } catch (error) {
            console.error('Error showing login page:', error);
        }
    }
    
    showRegisterPage() {
        try {
            const loginPage = document.getElementById('loginPage');
            if (loginPage) {
                loginPage.style.display = 'none';
            }
            
            const registerPage = document.getElementById('registerPage');
            if (registerPage) {
                registerPage.style.display = 'flex';
            }
            
            const cloudDrive = document.getElementById('cloudDrive');
            if (cloudDrive) {
                cloudDrive.style.display = 'none';
            }
        } catch (error) {
            console.error('Error showing register page:', error);
        }
    }
    
    showCloudDrive() {
        try {
            const loginPage = document.getElementById('loginPage');
            if (loginPage) {
                loginPage.style.display = 'none';
            }
            
            const registerPage = document.getElementById('registerPage');
            if (registerPage) {
                registerPage.style.display = 'none';
            }
            
            const cloudDrive = document.getElementById('cloudDrive');
            if (cloudDrive) {
                cloudDrive.style.display = 'flex';
            }
            
            // 更新用户名显示
            if (this.currentUser) {
                const usernameDisplay = document.getElementById('username-display');
                if (usernameDisplay) {
                    usernameDisplay.textContent = this.currentUser.username;
                }
            }
            
            // 初始化网盘
            if (window.initCloudDrive) {
                window.initCloudDrive();
            }
        } catch (error) {
            console.error('Error showing cloud drive:', error);
        }
    }
    
    login() {
        try {
            const loginUsername = document.getElementById('login-username');
            const loginPassword = document.getElementById('login-password');
            
            if (!loginUsername || !loginPassword) {
                alert('登录表单元素未找到');
                return;
            }
            
            const username = loginUsername.value;
            const password = loginPassword.value;
            
            if (!username || !password) {
                alert('请输入邮箱/手机号和密码');
                return;
            }
            
            // 查找用户
            const user = this.users.find(u => u.username === username && u.password === password);
            
            if (user) {
                this.currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.showCloudDrive();
                alert('登录成功！');
            } else {
                alert('邮箱/手机号或密码错误');
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('登录过程中发生错误，请重试。');
        }
    }
    
    register() {
        try {
            const registerUsername = document.getElementById('register-username');
            const registerPassword = document.getElementById('register-password');
            const registerConfirmPassword = document.getElementById('register-confirm-password');
            
            if (!registerUsername || !registerPassword || !registerConfirmPassword) {
                alert('注册表单元素未找到');
                return;
            }
            
            const username = registerUsername.value;
            const password = registerPassword.value;
            const confirmPassword = registerConfirmPassword.value;
            
            if (!username || !password || !confirmPassword) {
                alert('请填写所有必填字段');
                return;
            }
            
            if (password !== confirmPassword) {
                alert('两次输入的密码不一致');
                return;
            }
            
            if (password.length < 6) {
                alert('密码长度至少为6位');
                return;
            }
            
            // 检查用户是否已存在
            const existingUser = this.users.find(u => u.username === username);
            if (existingUser) {
                alert('该邮箱/手机号已注册');
                return;
            }
            
            // 创建新用户
            const newUser = {
                id: Date.now(),
                username: username,
                password: password,
                createdAt: new Date().toISOString()
            };
            
            this.users.push(newUser);
            localStorage.setItem('cloudDriveUsers', JSON.stringify(this.users));
            
            // 自动登录新用户
            this.currentUser = newUser;
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            
            this.showCloudDrive();
            alert('注册成功！');
        } catch (error) {
            console.error('Error during registration:', error);
            alert('注册过程中发生错误，请重试。');
        }
    }
    
    logout() {
        try {
            this.currentUser = null;
            localStorage.removeItem('currentUser');
            this.showLoginPage();
            alert('已退出登录');
        } catch (error) {
            console.error('Error during logout:', error);
            alert('退出登录过程中发生错误，请重试。');
        }
    }
}

// 当DOM加载完成后初始化认证系统
let auth;
document.addEventListener('DOMContentLoaded', () => {
    auth = new Auth();
});