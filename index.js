const redis = require('redis');
const inquirer = require('inquirer');

// Configuração do cliente Redis
const client = redis.createClient({
  socket: {
    host: 'localhost',
    port: 6379,
  },
});

client.on('connect', () => {
  console.log('|----------------------------------------|');
  console.log(' Conectado ao Redis com sucesso!');
  console.log('|----------------------------------------|');
});

client.on('error', (err) => {
  console.error('Erro ao conectar ao Redis:', err);
});

// Função para listar todos os dados
async function listarDados() {
  console.clear();
  try {
    const keys = await client.keys('*');
    if (keys.length === 0) {
      lableListaVazia();
      return;
    }

    lableListaTitulo();
    await listaDado(keys);
    
  } catch (err) {
    console.clear();
    console.error('Erro ao listar os dados:', err);
  }
}

async function listaDado(keys) {
  for (let key of keys) {
    client.get(key).then((value) => {
      console.log({
        Chave: key,
        Valor: value,
      })
    }).catch((err) => {
      console.error('Erro ao obter o valor:', err);
    })
  }
}

function lableListaVazia() {
  console.log('|----------------------------------------|');
  console.log(' Não há dados no Redis.');
  console.log('|----------------------------------------|');
  console.log();
}

function lableListaTitulo() {
  console.log('|----------------------------------------|');
  console.log(' Chaves e valores armazenados no Redis:');
  console.log('|----------------------------------------|');
  console.log();
}

// Função para deletar todos os dados
async function deletarDados() {
  console.clear();
  try {
    const confirmation = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmDelete',
        message: 'Tem certeza que deseja deletar todos os dados? Essa ação é irreversível.',
      },
    ]);

    if (confirmation.confirmDelete) {
      await client.flushAll();
      console.clear();
      console.log('|-------------------------------------------|');
      console.log(' Todos os dados foram deletados com sucesso.');
      console.log('|-------------------------------------------|');
      console.log();
    } else {
      console.clear();
      console.log('|---------------------------------------------|');
      console.log(' Ação de deletar todos os dados foi cancelada.');
      console.log('|---------------------------------------------|');
      console.log();
    }
  } catch (err) {
    console.clear();
    console.error('Erro ao deletar os dados:', err);
  }
}

async function addDados() {
  try {
    const responsta = await inquirer.prompt([
      {
        type: 'input',
        name: 'chave',
        message: 'Digite a chave:',
      },
      {
        type: 'input',
        name: 'valor',
        message: 'Digite o valor:'
      }
    ]);

    await client.set(responsta.chave, responsta.valor);
  } catch (err) {
    console.error('Erro ao adicionar dados:', err);
  }
}

async function limparTela() {
  console.clear();
}

// Menu interativo
async function menu() {
  await client.connect();

  try {
    while (true) {
      const resposta = await inquirer.prompt([
        {
          type: 'list',
          name: 'opcao',
          message: 'O que você deseja fazer?',
          choices: [
            'Listar todos os dados',
            'Deletar todos os dados',
            'Adicionar dados',
            'Sair',
          ],
        },
      ]);

      if (resposta.opcao === 'Listar todos os dados') {
        await listarDados();
      } else if (resposta.opcao === 'Deletar todos os dados') {
        await deletarDados();
      } else if (resposta.opcao === 'Adicionar dados') {
        await addDados();
      } else if (resposta.opcao === 'Limpar tela') {
        await limparTela();
      } else if (resposta.opcao === 'Sair') {
        console.log('Encerrando o programa...');
        break;
      }
    }
  } finally {
    await client.quit();
  }
}

// Inicia o programa
menu().catch((err) => {
  console.error('Erro inesperado:', err);
});
