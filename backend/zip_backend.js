const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const outputZip = '../dinner-backend-v4.zip';
const sourceDir = '.';

// 使用 7-Zip (如果安装了) 或 PowerShell 的 Compress-Archive 可能会有问题
// 最好的跨平台方式是使用 'adm-zip' 库，但我们没有安装。
// 我们可以尝试使用 jar 命令（如果安装了 java）或者 python。

// 既然是 Windows 环境，我们可以尝试构造一个不带路径的 zip 结构，或者使用 Python (通常预装在开发机上)
// 让我们尝试使用 Python 的 zipfile 模块，这通常更可靠且处理路径分隔符更好

const pythonScript = `
import zipfile
import os
import sys

def zip_folder(folder_path, output_path):
    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(folder_path):
            if 'node_modules' in root or '.git' in root:
                continue
            for file in files:
                if file.endswith('.zip') or file.endswith('.log'):
                    continue
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, folder_path)
                # 强制使用正斜杠
                arcname = arcname.replace(os.path.sep, '/')
                zipf.write(file_path, arcname)
                print(f"Adding {arcname}")

if __name__ == "__main__":
    zip_folder('${sourceDir}', '${outputZip}')
`;

const pythonFile = 'zip_script.py';
fs.writeFileSync(pythonFile, pythonScript);

try {
    console.log('Using Python to create zip...');
    execSync(`python ${pythonFile}`, { stdio: 'inherit' });
    console.log('Zip created successfully!');
} catch (e) {
    console.error('Failed to create zip with Python:', e);
} finally {
    fs.unlinkSync(pythonFile);
}
