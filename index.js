const inquirer = require("inquirer");
const chalk = require("chalk");
const fs = require("fs");

const operations = () => {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "O que você deseja fazer?",
        choices: [
          "Criar Conta",
          "Consultar Saldo",
          "Depositar",
          "Sacar",
          "Sair",
        ],
      },
    ])
    .then((res) => {
      const action = res["action"];

      if (action === "Criar Conta") createAccount();
      if (action === "Consultar Saldo") {
        getAccountBalance();
      }
      if (action === "Depositar") {
        deposit();
      }
      if (action === "Sacar") {
        withdraw();
      }
      if (action === "Sair") {
        console.log(chalk.bgBlue(`Obrigado por usar o Accounts!`));
        process.exit();
      }
    })
    .catch((error) => console.error(error));
};
operations();

//  CRIAR CONTA
const createAccount = () => {
  console.log(chalk.bgGreen.black("Parabéns por escolher o nosso banco!"));
  console.log(chalk.green("Defina as opções da sua conta a seguir."));

  buildAccount();
};

const buildAccount = () => {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Digite um nome para a sua conta:",
      },
    ])
    .then((res) => {
      const accountName = res["accountName"];

      if (!fs.existsSync("accounts")) {
        fs.mkdirSync("accounts");
      }

      if (fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(chalk.bgRed("Esta conta já existe, escolha outro nome."));
        buildAccount();
        return;
      }

      fs.writeFileSync(
        `accounts/${accountName}.json`,
        '{"balance": 0}',
        (error) => {
          console.error(error);
        }
      );

      console.log(chalk.green("Parabéns! Sua conta foi criada com sucesso."));
      operations();
    })
    .catch((error) => console.error(error));
};

//  Depositar
const deposit = () => {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((res) => {
      const accountName = res["accountName"];

      if (!checkAccount(accountName)) {
        return deposit();
      }

      inquirer
        .prompt([
          {
            name: "amount",
            message: "Quanto você deseja depositar?",
          },
        ])
        .then((res) => {
          const amount = res["amount"];

          if (!amount) {
            console.log(chalk.bgRed("Ocorreu um erro. Tente novmente."));
            return deposit();
          }

          addAmount(accountName, amount);

          operations();
        })
        .catch((error) => console.error(error));
    })
    .catch((error) => console.error(error));
};

const checkAccount = (accountName) => {
  if (!fs.existsSync(`accounts/${accountName}.json`)) {
    console.log(chalk.bgRed("Esta conta não existe."));
    return false;
  }

  return true;
};

const addAmount = (accountName, amount) => {
  const accountData = getAccount(accountName);

  if (!amount) {
    console.log(chalk.bgRed("Ocorreu um erro. Tente novamente mais tarde."));
    return deposit();
  }

  accountData.balance = parseFloat(amount) + parseFloat(accountData.balance);

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    (error) => console.log(error)
  );

  console.log(
    chalk.green(
      `${accountName}, R$${amount} depositado com sucesso na sua conta!`
    )
  );
};

const getAccount = (accountName) => {
  const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: "utf8",
    flag: "r",
  });

  return JSON.parse(accountJSON);
};

const getAccountBalance = () => {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((res) => {
      const accountName = res["accountName"];

      if (!checkAccount(accountName)) {
        return getAccountBalance();
      }

      const accountData = getAccount(accountName);

      console.log(
        chalk.bgGreen(`Seu saldo é de R$${accountData.balance}, ${accountName}`)
      );

      operations();
    })
    .catch((error) => console.log(error));
};

const withdraw = () => {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((res) => {
      const accountName = res["accountName"];

      if (!checkAccount(accountName)) {
        return withdraw();
      }

      inquirer
        .prompt([
          {
            name: "amount",
            message: "Quanto você deseja sacar?",
          },
        ])
        .then((res) => {
          const amount = res["amount"];

          removeAmount(accountName, amount);
        })
        .catch((error) => console.log(error));
    })
    .catch((error) => console.log(error));
};

const removeAmount = (accountName, amount) => {
  const accountData = getAccount(accountName);

  if (!amount) {
    console.log(chalk.bgRed("Ocorreu um erro. Tente novamente mais tarde."));
    return withdraw();
  }

  if (accountData.balance < amount) {
    console.log(chalk.bgRed("Você não tem este valor disponível."));
    return withdraw();
  }

  accountData.balance = parseFloat(accountData.balance) - parseFloat(amount);

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    (error) => console.log(error)
  );

  console.log(chalk.green(`Saque de R$${amount} realizado.`));

  operations();
};
