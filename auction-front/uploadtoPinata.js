const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Função para fazer upload de um diretório para o IPFS
async function uploadDirectoryToIPFS(directoryPath) {
  const formData = new FormData();
  
  function walkDir(currentPath) {
    const files = fs.readdirSync(currentPath);
    files.forEach((file) => {
      const fullPath = path.join(currentPath, file);
      if (fs.lstatSync(fullPath).isDirectory()) {
        walkDir(fullPath);
      } else {
        formData.append('file', fs.createReadStream(fullPath), { filepath: path.relative(directoryPath, fullPath) });
      }
    });
  }

  walkDir(directoryPath);

  const url = `http://127.0.0.1:5001/api/v0/add?recursive=true`;

  try {
    const response = await axios.post(url, formData, {
      maxContentLength: 'Infinity', // Devido ao tamanho potencial dos arquivos
      headers: {
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`
      },
    });
    console.log('Upload bem-sucedido! CID:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('Erro na resposta do IPFS:', error.response.data);
    } else if (error.request) {
      console.error('Erro na requisição ao IPFS:', error.request);
    } else {
      console.error('Erro na configuração da requisição:', error.message);
    }
    console.error('Configuração do erro:', error.config);
  }
}

uploadDirectoryToIPFS(path.join(__dirname, 'build'));
