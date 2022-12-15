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

This is all handled through the included `\js\easi-custom.js` file, which implements some simple javascript to take the existing drowdowns for resource allocations and resource requests and converts them to buttons. The dropdowns remain in place in the html but are hidden from view. When the user interacts with these buttons, the dropdowns are changed dynamically in the background. This means that there is no change to the underlying functionality of the Jupyter Hub interface. The buttons are simply additional items that the user interacts with.

This template also supports the styling of the spawner options, giving them a similar styling to the buttons mentioned above. This is currently achieved by modifying the spawner groups in DynamoDB. The temporary approach is to embed the required HTML in the `display_name` element of both the `profiles` and `requests` components of the `spawner-groups` table. Examples are provided below.

These appraoches are temporary but functional and will likely be replaced with more complete solutions such as the addition of tags to the dynamodb entries rather than raw HTML.

### Allocations buttons
Allocations buttons are created dynamically from the existing allocations dropdown. This simply uses the existing content which comes from the DynamoDB `easi-allocations` table. The `code` is presented in bold, while the `label` is shown in simple text.

A DynamoDB entry like:
```json
{
  "code": {
    "S": "CSIRO"
  },
  "label": {
    "S": "CSIRO projects"
  }
}
```
or in normal json:
```json
{
  "code": "CSIRO",
  "label": "CSIRO projects"
}
```
will be represented as a styled button similar to:
<div style="border:solid 1px; width:120px; text-align:center"><span><strong>CSIRO</strong><br>CSIRO projects</span></div><br>
  
### Requests buttons
Requests buttons are created dynamically from the existing requests dropdown. This uses a temporary formatting trick to add a "title" to the button. This is defined by placing a title between `|-` and `-|` "tags". These have been used because normal HTML tags cause issues in the way that this dropdown is used. 

Any semicolon in the `display_name` will be replaced with a line break.

```json
"display_name": {
  "S": "|-DEFAULT-|8 CPU;30GiB;GPU: None"
}
```

```json
"display_name": "|-DEFAULT-|8 CPU;30GiB;GPU: None"
```

This example will displayed as a styled button similar to:

<div style="border:solid 1px; width:85px; text-align:center">
<span>
<strong>DEFAULT</strong>
<br>8 CPU<br>30GiB<br>GPU: None
</span>
</div><br>

See [hub.datacubechile.cl](https://hub.datacubechile.cl) for examples of how these appear on screen.

### Spawner profiles
The `profiles` component is set by adding valid HTML to the `display_name`. Python, R and NVIDIA logos are added dynamically by adding an empty div with one of three css classes:
* `<div class='python-logo'></div>`
* `<div class='r-logo'></div>`
* `<div class='nvidia-logo'></div>`

These must be wrapped in a parent div:
* `<div class='spawner-logos'></div>`

The required logos are included in `extra-assets/images`.

DynamoDB JSON:
```json
"display_name": {
  "S": "Python and R environment (master.latest)<div class='spawner-logos'><div class='python-logo'></div><div class='r-logo'></div></div>"
}
```
Normal JSON:
```json
"display_name": "Default Jupyter Python environment (master.latest)<div class='spawner-logos'><div class='python-logo'></div></div>"
```





## JupyterHub Helm manifest
Some changes to the Helm manifest are also required to fully support this template. The two key changes are:
* `easi_welcome` is now an array which is converted to individual `<p>` elements in the rendered HTML
* addition of the `easi_partner_logos` array which if present will add the logos in a line below the welcome text. Each item in the `easi_partner_logos` array must contain an `href` and a `src` item as shown below. All logos must be added to `extra-assets/images`
* addition of the `announcement_level` item with valid values `info|success|warning|danger`

> Note that the `announcement` value was always possible but unused. It is possible to add HTML tags to this as required. The example below uses a mix of `<h3>`, `<h4>` and `<strong>` tags to add emphasis. The `announcement_level` will colour the announcement using standard Bootstrap CSS Alert colours. See [https://getbootstrap.com/docs/4.0/components/alerts/](https://getbootstrap.com/docs/4.0/components/alerts/). The general colours are:
> * info = blue
> * success = green
> * warning = yellow
> * danger = red
> 
> If no level is given, the default is a warning (yellow) alert. See [hub.datacubechile.cl](https://hub.datacubechile.cl) for an example of how an alert appears on screen.

Below is an example extract from a `jupyterhub-patch.yaml` file (Flux v2).

```yaml
extraConfig:
    00-template-config: |
      c.JupyterHub.template_paths = ['/usr/local/share/jupyterhub/custom-templates/','/usr/local/share/jupyterhub/templates/']
      c.JupyterHub.logo_file = '/usr/local/share/jupyterhub/static/extra-assets/images/datacube-chile-transparente.png'
      c.JupyterHub.template_vars = {
        'easi_hub_title': 'Data Cube Chile',
        'easi_hub_subtitle': 'Environment: Prod,  Region: us-west-2',
        'announcement': '<h3>PRODUCT UPDATE NOTICE</h3><h4>The <strong>Sentinel-3</strong> product <strong class="text-danger">s3_ol_2_wfr</strong> has moved to <strong class="text-success">s3_ol_2_wfr_ntc</strong></h4><p>Please update your notebooks accordingly.</p><p>See <a href="https://explorer.datacubechile.cl/products/s3_ol_2_wfr_ntc" target="_blank">https://explorer.datacubechile.cl/products/s3_ol_2_wfr_ntc</a> for more details.</p>',
        'announcement_level': 'warning',
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
        ]
      }
```

## Other notes
* the spawner styling a logos should eventually be done via a modification to the spawner form, which is part of the `terraform-k8s-easi-jupyterhub` Terraform module. See: https://dev.azure.com/csiro-easi/easi-hub-partners/_git/easi-tf-modules?path=/terraform-k8s-easi-jupyterhub/config/spawner-config.py&version=GBmaster&line=577&lineEnd=578&lineStartColumn=1&lineEndColumn=1&lineStyle=plain&_a=contents
* Python, R and NVIDIA logos should be added by adding some simple "tags" to the DynamoDB entries and then handled fully via HTML and Javascript rather than adding raw HTML in DynamoDB
* Resource selection options will change in future as per previous discussions. This could be modified to use a series of buttons.
* It should be possible to permit users to set their own defaults by saving some simple preferences back to DynamoDB against the user's entry... subject to security constraints.