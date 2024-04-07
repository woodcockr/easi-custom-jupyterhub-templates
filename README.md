# Custom JupyterHub Templates for CSIRO EASI

This repo contains html jinja2 templates for customising the appearance of JupyterHub. Each HTML file here will override the files in `https://github.com/jupyterhub/jupyterhub/tree/main/share/jupyterhub/templates`.

## Usage

To use this repo ensure it is checked out and available somewhere that JupyterHub can find it. In thie example we will assume we have cloned it somewhere and created the following symlinks

`/path/to/repo/templates` -> `usr/local/share/jupyterhub/custom-templates/`
`/path/to/repo/assets` -> `/usr/local/share/jupyterhub/static/extra-assets/`

Add the following to your JupyterHub config

```python
c.JupyterHub.logo_file = '/usr/local/share/jupyterhub/static/extra-assets/images/logo.png'
c.JupyterHub.template_paths = ['/usr/local/share/jupyterhub/custom-templates/',
                                '/usr/local/share/jupyterhub/templates/']
```

## Visual and styling customisations

This template includes some additional visual styling and javascript customisations which modify the look and feel of the Jupyter Hub interface, particularly when users are selecting resource allocations, resource requests and spawner options.

### Theme colour

The templates can receive a variable named `easi_primary_colour` which will be used on components like buttons and links. It falls back to "#004b87" which is CSIRO's standard primary web colour.

### Spawn page

The spawners page form is generated through the included `/extra-assets/js/easi-spawner.js` file, which replaces the default form with a custom React.js component.

#### Workspace

This is rendered as a select with options that represent the workspaces a user is a member of. The form will submit the workspace.code as the value.

#### Features

This is a group of buttons that can be used to filter the list of profiles that a user can select. These features are derived from the profile entries in a spawner group record in dynamodb.

The following features also have a logo associated with them that will show in matching profiles in the profile list.

- Python <img src="extra-assets/images/python-logo.png" alt="python-logo" style="width:20px;height:20px;" />
- R <img src="extra-assets/images/r-logo.png" alt="python-logo" style="width:20px;height:20px;" />
- GPU <img src="extra-assets/images/nvidia-logo.png" alt="python-logo" style="width:20px;height:20px;" />

#### Profiles

This is list of profiles that a user is able to select from. It uses fields from profile entries in spawner group records.

#### Resources

Inputs to configure the spawner instance resouces. The constraints for these inputs come from spawner group records.

## Release notes

The release notes can be passed in through `easi_release_notes` template variable. They will be available under the main navigation link 'Release notes'. When the link is clicked a modal is opened with the release notes showing. The release notes will only be available to authenticated users.

## JupyterHub Helm manifest

Some changes to the Helm manifest are also required to fully support this template. The two key changes are:

- `easi_welcome` is now an array which is converted to individual `<p>` elements in the rendered HTML
- addition of the `easi_partner_logos` array which if present will add the logos in a line below the welcome text. Each item in the `easi_partner_logos` array must contain an `href` and a `src` item as shown below. All logos must be added to `extra-assets/images`
- addition of the `announcement_level` item with valid values `info|success|warning|danger`

Below is an example extract from a `jupyterhub-patch.yaml` file (Flux v2).

```yaml
extraConfig:
  00-template-config: |
    c.JupyterHub.template_paths = ['/usr/local/share/jupyterhub/custom-templates/','/usr/local/share/jupyterhub/templates/']
    c.JupyterHub.logo_file = '/usr/local/share/jupyterhub/static/extra-assets/images/datacube-chile-transparente.png'
    c.JupyterHub.template_vars = {
      'easi_hub_title': 'Data Cube Chile',
      'easi_hub_subtitle': 'Environment: Prod,  Region: us-west-2',
      'easi_release_notes': '<h3>PRODUCT UPDATE NOTICE</h3><h4>The <strong>Sentinel-3</strong> product <strong class="text-danger">s3_ol_2_wfr</strong> has moved to <strong class="text-success">s3_ol_2_wfr_ntc</strong></h4><p>Please update your notebooks accordingly.</p><p>See <a href="https://explorer.datacubechile.cl/products/s3_ol_2_wfr_ntc" target="_blank">https://explorer.datacubechile.cl/products/s3_ol_2_wfr_ntc</a> for more details.</p>',
      'easi_welcome': [
        """Welcome to <strong>Data Cube Chile</strong>.""",
        """This system is maintained by <a href="https://www.csiro.cl" target="_blank">CSIRO Chile</a> in collaboration with <a href="https://www.uai.cl" target="_blank">Universidad Adolfo Ibáñez</a> and the <a href="https://www.dataobservatory.net" target="_blank">Data Observatory</a>.""",
        """<strong>This is a development environment and should be treated accordingly.</strong>""",
        """<strong>Do not store passwords or sensitive data in your home directory.</strong>""",
        """For more information, visit the <a href="https://www.datacubechile.cl" target="_blank">Data Cube Chile</a> website."""
      ],
      'easi_partner_logos': [
        {'href':'https://www.uai.cl','src':'extra-assets/images/UAI-logo.png'},
        {'href':'https://www.csiro.cl','src':'extra-assets/images/csiro-chile-logo.png'},
        {'href':'https://www.dataobservatory.net','src':'extra-assets/images/DO-logo.png'}
      ],
      'easi_primary_colour': '#008800'
    }
```

## Other notes

- the spawner styling a logos should eventually be done via a modification to the spawner form, which is part of the `terraform-k8s-easi-jupyterhub` Terraform module. See: https://dev.azure.com/csiro-easi/easi-hub-partners/_git/easi-tf-modules?path=/terraform-k8s-easi-jupyterhub/config/spawner-config.py&version=GBmaster&line=577&lineEnd=578&lineStartColumn=1&lineEndColumn=1&lineStyle=plain&_a=contents
- It should be possible to permit users to set their own defaults by saving some simple preferences back to DynamoDB against the user's entry... subject to security constraints.
