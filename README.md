# ggaw - Generate GitHub Action workflow(s)

Generate github action workflows for one or more GitHub repository. 
- For developer instructions, see the [developer README](DEVELOP.md)

### Schematic representation of generating Github Actions workflow 
![Schematic representation of generating Github Actions workflow](./schematicDiagram.png)

### Sequence Diagram of generating Github Actions workflow
![Sequence diagram of generating Github Actions workflow](./sequenceDiagram.png)

##### Pre-requisites

- Obtain a GitHub private token as prescribed [here](./README.md#creating-a-private-token-for-github)

```bash
# Example current versions, also known to work with earlier versions
$ node --version
v15.7.0

$ npm --version
7.4.3
```

### Installation

```bash
$ npm run build
```

### Setup config

```bash
# set config
$ cp config/example.yml /path/to/my/config.yml
# update the config with appropriate values

# Set config directory path
$ export NODE_CONFIG_DIR="path-to-directory-containing-config"
# set appropriate config environment
$ export NODE_CONFIG_ENV="your_config_file_name"
```

### Help

```bash
$ ggaw -h
```

### Generate github action workflows for all repos under specified org

```bash
$ ggaw create-workflows my-github-org
```

### Clean up

Clean up any installed binary for migration

```bash
$ npm run clean
```

### Creating a private token for GitHub
- Navigate to your [GitHub Personal access tokens](https://github.com/settings/tokens)
- Click `Generate new token`
- Enter some text for `Note` and choose scopes: 
  - `repo` (to configure repositories)
  - `workflow` (to configure github action workflows)
  - `admin:org` (to configure/manage github orgs)
  - `user` (to configure/manage user's data)
- If you have SSO enabled, additionally you may need to authorize the token to be used for a specific org 
- Copy the generated token