const path = require("path");
const fs = require("fs-extra");
const chalk = require("chalk");
const inquirer = require("inquirer");
const downLoad = require("download-git-repo");
const ora = require("ora");
const { address } = require("./address.js");

const cwd = process.cwd();

class Creator {
  constructor(projectName, options) {
    this.projectName = projectName;
    this.options = options;
    this.address = address;
  }

  // 创建
  async create() {
    const isOverwrite = await this.handleDirectory();
    if (!isOverwrite) return;
    const selected = await this.chooseTemeplate();
    this.getTemeplate(selected);
  }

  // 处理是否有相同目录
  async handleDirectory() {
    const targetDirectory = path.join(cwd, this.projectName);

    // 如果目录中存在了需要创建的目录
    if (fs.existsSync(targetDirectory)) {
      if (this.options.force) {
        await fs.remove(targetDirectory);
      } else {
        let { isOverwrite } = await new inquirer.prompt([
          {
            name: "isOverwrite",
            type: "list",
            message: "是否强制覆盖已存在的同名目录？",
            choices: [
              {
                name: "覆盖",
                value: true,
              },
              {
                name: "不覆盖",
                value: false,
              },
            ],
          },
        ]);
        if (isOverwrite) {
          await fs.remove(targetDirectory);
        } else {
          console.log(chalk.red.bold("不覆盖文件夹，创建终止"));
          return false;
        }
      }
    }
    return true;
  }

  // 获取模板信息及用户选择的模板
  async chooseTemeplate() {
    // 选取模板信息
    let { name, value } = await new inquirer.prompt([
      {
        name: "name",
        type: "list",
        message: "请选择模板",
        choices: [
          {
            name: "Vue3",
            value: "Vue3",
          },
          {
            name: "Vue3+TS",
            value: "Vue3+TS",
          },
        ],
      },
    ]);
    return name;
  }

  // 获取模板
  async getTemeplate(selected) {
    const spinner = ora("正在下载模板,请稍后").start();
    for (const item of address) {
      if (item.name === selected && item.url) {
        downLoad(item.url, this.projectName, (err) => {
          if (err) {
            spinner.fail();
            console.log(chalk.red("失败"));
            return;
          } else {
            spinner.succeed();
            console.log(chalk.green("下载成功"));
            return;
          }
        });
      }
    }
  }
}

module.exports = async function (projectName, options) {
  const creator = new Creator(projectName, options);
  await creator.create();
};
