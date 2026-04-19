class CloudDrive {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.files = this.getUserFiles();
        this.currentView = 'list';
        this.init();
    }
    
    init() {
        if (!this.currentUser) return;
        this.bindEvents();
        this.renderFiles();
        this.updateStorageInfo();
    }
    
    getUserFiles() {
        if (!this.currentUser) return [];
        try {
            // 优先从localStorage获取
            const allFiles = JSON.parse(localStorage.getItem('cloudDriveFiles')) || {};
            return allFiles[this.currentUser.username] || [];
        } catch (error) {
            console.error('Error getting user files:', error);
            return [];
        }
    }
    
    saveFiles() {
        if (!this.currentUser) return;
        try {
            const allFiles = JSON.parse(localStorage.getItem('cloudDriveFiles')) || {};
            allFiles[this.currentUser.username] = this.files;
            localStorage.setItem('cloudDriveFiles', JSON.stringify(allFiles));
        } catch (error) {
            console.error('Error saving user files:', error);
        }
    }
    
    bindEvents() {
        // 上传按钮事件
        const uploadBtn = document.getElementById('upload-btn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
                document.getElementById('file-input').click();
            });
        }
        
        // 文件选择事件
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.uploadFiles(e.target.files);
            });
        }
        
        // 刷新按钮事件
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.files = this.getUserFiles();
                this.renderFiles();
                this.updateStorageInfo();
            });
        }
        
        // 搜索按钮事件
        const searchBtn = document.getElementById('search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.searchFiles();
            });
        }
        
        // 搜索输入框回车事件
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchFiles();
                }
            });
        }
        
        // 列表视图按钮事件
        const listViewBtn = document.getElementById('list-view-btn');
        if (listViewBtn) {
            listViewBtn.addEventListener('click', () => {
                this.switchView('list');
            });
        }
        
        // 网格视图按钮事件
        const gridViewBtn = document.getElementById('grid-view-btn');
        if (gridViewBtn) {
            gridViewBtn.addEventListener('click', () => {
                this.switchView('grid');
            });
        }
        
        // 导出数据按钮事件
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }
        
        // 导入数据按钮事件
        const importBtn = document.getElementById('import-btn');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                document.getElementById('import-file').click();
            });
        }
        
        // 导入文件选择事件
        const importFile = document.getElementById('import-file');
        if (importFile) {
            importFile.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.importData(e.target.files[0]);
                }
            });
        }
    }
    
    uploadFiles(fileList) {
        if (!this.currentUser) return;
        
        const newFiles = [];
        
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            const fileId = Date.now() + i;
            
            const fileData = {
                id: fileId,
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: new Date().toISOString(),
                url: URL.createObjectURL(file)
            };
            
            newFiles.push(fileData);
        }
        
        this.files = [...this.files, ...newFiles];
        this.saveFiles();
        this.renderFiles();
        this.updateStorageInfo();
    }
    
    downloadFile(fileId) {
        const file = this.files.find(f => f.id === fileId);
        if (!file) return;
        
        const a = document.createElement('a');
        a.href = file.url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    
    deleteFile(fileId) {
        if (!this.currentUser) return;
        
        if (confirm('确定要删除这个文件吗？')) {
            this.files = this.files.filter(f => f.id !== fileId);
            this.saveFiles();
            this.renderFiles();
            this.updateStorageInfo();
        }
    }
    
    searchFiles() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const filteredFiles = this.files.filter(file => 
            file.name.toLowerCase().includes(searchTerm)
        );
        this.renderFiles(filteredFiles);
    }
    
    switchView(view) {
        this.currentView = view;
        const listViewBtn = document.getElementById('list-view-btn');
        const gridViewBtn = document.getElementById('grid-view-btn');
        if (listViewBtn && gridViewBtn) {
            listViewBtn.classList.toggle('active', view === 'list');
            gridViewBtn.classList.toggle('active', view === 'grid');
        }
        this.renderFiles();
    }
    
    renderFiles(filesToRender = this.files) {
        const fileListContainer = document.getElementById('file-list');
        if (!fileListContainer) return;
        
        if (filesToRender.length === 0) {
            fileListContainer.innerHTML = `
                <div class="empty-state">
                    <p>📁 暂无文件</p>
                    <p>点击上传按钮添加文件</p>
                </div>
            `;
            return;
        }
        
        if (this.currentView === 'list') {
            fileListContainer.innerHTML = filesToRender.map(file => `
                <div class="file-item">
                    <div class="file-icon">${this.getFileIcon(file.type)}</div>
                    <div class="file-info">
                        <div class="file-name">${file.name}</div>
                        <div class="file-meta">
                            ${this.formatFileSize(file.size)} • ${this.formatDate(file.lastModified)}
                        </div>
                    </div>
                    <div class="file-actions">
                        <button class="btn btn-secondary" onclick="cloudDrive.downloadFile(${file.id})">下载</button>
                        <button class="btn btn-secondary" onclick="cloudDrive.deleteFile(${file.id})">删除</button>
                    </div>
                </div>
            `).join('');
        } else {
            fileListContainer.innerHTML = `
                <div class="file-grid">
                    ${filesToRender.map(file => `
                        <div class="file-grid-item">
                            <div class="file-grid-icon">${this.getFileIcon(file.type)}</div>
                            <div class="file-grid-name">${file.name}</div>
                            <div class="file-grid-meta">
                                ${this.formatFileSize(file.size)}
                            </div>
                            <div class="file-grid-actions">
                                <button class="btn btn-secondary" onclick="cloudDrive.downloadFile(${file.id})">下载</button>
                                <button class="btn btn-secondary" onclick="cloudDrive.deleteFile(${file.id})">删除</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }
    
    updateStorageInfo() {
        const storageUsed = document.getElementById('storage-used');
        const storageText = document.getElementById('storage-text');
        if (!storageUsed || !storageText) return;
        
        const totalStorage = 512 * 1024 * 1024; // 512MB
        const usedStorage = this.files.reduce((total, file) => total + file.size, 0);
        const usedPercentage = (usedStorage / totalStorage) * 100;
        
        storageUsed.style.width = `${Math.min(usedPercentage, 100)}%`;
        storageText.textContent = `已用: ${this.formatFileSize(usedStorage)} / 总: ${this.formatFileSize(totalStorage)}`;
    }
    
    getFileIcon(fileType) {
        if (fileType.includes('image')) return '🖼️';
        if (fileType.includes('video')) return '🎬';
        if (fileType.includes('audio')) return '🎵';
        if (fileType.includes('text') || fileType.includes('document')) return '📄';
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('zip') || fileType.includes('compressed')) return '📦';
        return '📄';
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    exportData() {
        if (!this.currentUser) return;
        
        try {
            // 准备导出数据
            const exportData = {
                user: this.currentUser.username,
                files: this.files,
                exportDate: new Date().toISOString()
            };
            
            // 创建JSON文件
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            // 下载文件
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `cloud-drive-data-${this.currentUser.username}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            alert('数据导出成功！');
        } catch (error) {
            console.error('Error exporting data:', error);
            alert('数据导出失败，请重试。');
        }
    }
    
    importData(file) {
        if (!this.currentUser) return;
        
        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importData = JSON.parse(e.target.result);
                    
                    // 验证数据格式
                    if (!importData.files || !Array.isArray(importData.files)) {
                        alert('导入文件格式不正确！');
                        return;
                    }
                    
                    // 确认导入
                    if (confirm('确定要导入数据吗？这将覆盖当前文件！')) {
                        this.files = importData.files;
                        this.saveFiles();
                        this.renderFiles();
                        this.updateStorageInfo();
                        alert('数据导入成功！');
                    }
                } catch (parseError) {
                    console.error('Error parsing import data:', parseError);
                    alert('导入文件解析失败，请检查文件格式。');
                }
            };
            reader.onerror = (error) => {
                console.error('Error reading import file:', error);
                alert('读取导入文件失败，请重试。');
            };
            reader.readAsText(file);
        } catch (error) {
            console.error('Error importing data:', error);
            alert('数据导入失败，请重试。');
        }
    }
}

// 初始化网盘
let cloudDrive;
function initCloudDrive() {
    cloudDrive = new CloudDrive();
}

// 当DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 检查是否有当前用户
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        initCloudDrive();
    }
});

// 暴露给全局，以便在HTML中使用
window.initCloudDrive = initCloudDrive;