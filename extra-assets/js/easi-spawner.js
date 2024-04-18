require(["react", "react-dom", "lodash", "clsx", "easi-i18n"], function (
  React,
  ReactDOM,
  _,
  clsx,
  { useI18n, I18nProvider }
) {
  const { createElement: e, useState, useEffect } = React;

  const logos = {
    GPU: "/hub/static/extra-assets/images/nvidia-logo.png",
    Python: "/hub/static/extra-assets/images/python-logo.png",
    R: "/hub/static/extra-assets/images/r-logo.png",
  };

  const resourcePresets = [
    {
      label: "Small",
      resourcesConfiguration: {
        cpu: 2,
        ram: 16,
        storage: {
          count: 0,
          ssd: true,
        },
      },
    },
    {
      label: "Medium",
      resourcesConfiguration: {
        cpu: 8,
        ram: 64,
        storage: {
          count: 0,
          ssd: true,
        },
      },
    },
    {
      label: "Large",
      resourcesConfiguration: {
        cpu: 32,
        ram: 256,
        storage: {
          count: 0,
          ssd: true,
        },
      },
    },
  ];

  const conformResourcesToConfiguration = ({
    resources,
    resourcesConfiguration,
  }) => ({
    cpu: _.clamp(
      resources.cpu,
      resourcesConfiguration.cpu.min,
      resourcesConfiguration.cpu.max
    ),
    gpu: {
      count: _.clamp(
        resources.gpu.count,
        resourcesConfiguration.gpu.count.min,
        resourcesConfiguration.gpu.count.max
      ),
      type: _.find(resourcesConfiguration.gpu.types, {
        value: resources.gpu.type,
      })
        ? resources.gpu.type
        : _.first(resourcesConfiguration.gpu.types).value,
    },
    ram: _.clamp(
      resources.ram,
      resourcesConfiguration.ram.min,
      resourcesConfiguration.ram.max
    ),
    storage: {
      count: _.clamp(
        resources.storage.count,
        resourcesConfiguration.storage.count.min,
        resourcesConfiguration.storage.count.max
      ),
      ssd: _.includes(resourcesConfiguration.storage.ssd, resources.storage.ssd)
        ? resources.storage.ssd
        : _.first(resourcesConfiguration.storage.ssd),
    },
  });

  const getInitialResourcesValue = ({ resourcesConfiguration, selected }) => {
    const cpu = _.defaultTo(
      _.get(selected, "resources.cpu"),
      resourcesConfiguration.cpu.default
    );
    const gpuCount = _.defaultTo(
      _.get(selected, "resources.gpu.count"),
      resourcesConfiguration.gpu.count.default
    );
    const gpuType = _.defaultTo(
      _.get(
        _.find(resourcesConfiguration.gpu.types, {
          value: _.get(selected, "resources.gpu.type"),
        }),
        "value"
      ),
      _.first(resourcesConfiguration.gpu.types).value
    );
    const ram = _.defaultTo(
      _.get(selected, "resources.ram"),
      resourcesConfiguration.ram.default
    );
    const storageCount = _.defaultTo(
      _.get(selected, "resources.storage.count"),
      resourcesConfiguration.storage.count.default
    );
    const storageSsd = _.defaultTo(
      _.get(selected, "resources.storage.ssd"),
      _.first(resourcesConfiguration.storage.ssd)
    );
    const resources = {
      cpu,
      gpu: {
        count: gpuCount,
        type: gpuType,
      },
      ram,
      storage: {
        count: storageCount,
        ssd: storageSsd,
      },
    };
    return conformResourcesToConfiguration({
      resources,
      resourcesConfiguration,
    });
  };

  const getInitialValues = ({
    workspaces,
    profiles,
    resourcesConfiguration,
    selected,
    allFeatures,
  }) => {
    const workspace = _.defaultTo(
      _.find(workspaces, { code: _.get(selected, "workspace_code") }),
      _.first(workspaces)
    );
    const profile = _.defaultTo(
      _.find(profiles, { name: _.get(selected, "profile_id") }),
      _.first(profiles)
    );
    const version = _.get(
      _.defaultTo(
        _.find(profile.versions, { tag: _.get(selected, "image_tag") }),
        _.first(profile.versions)
      ),
      "label"
    );
    const resources = getInitialResourcesValue({
      resourcesConfiguration,
      selected,
    });
    const features = _.intersection(
      allFeatures,
      _.defaultTo(_.get(selected, "features"), [])
    );
    return { workspace, resources, profile, version, features };
  };

  const Workspaces = ({ workspaces, onChange, value }) => {
    const i18n = useI18n();
    return e(
      "div",
      { className: "row" },
      e("div", { className: "col-sm-4" }, [
        e("div", { className: "form-group mb-5" }, [
          e("label", { htmlFor: "workspace" }, i18n.t("spawner.workspace")),
          e(
            "select",
            {
              id: "workspace",
              className: "form-control input-lg",
              value: value.code,
              onChange: (e) =>
                onChange(_.find(workspaces, { code: e.target.value })),
            },
            workspaces.map(({ label, code }) =>
              e("option", { key: code, value: code }, label)
            )
          ),
        ]),
      ])
    );
  };

  const Features = ({ options, value, onChange }) => {
    const i18n = useI18n();
    return [
      e("div", {}, e("label", {}, i18n.t("spawner.features"))),
      e(
        "div",
        { className: "btn-group mb-5" },
        options.map((feature) =>
          e(
            "button",
            {
              key: feature,
              className: clsx("btn btn-lg", {
                "btn-primary": _.includes(value, feature),
                "btn-default": !_.includes(value, feature),
              }),
              onClick: () => {
                if (_.includes(value, feature)) {
                  onChange(_.without(value, feature));
                } else {
                  onChange([...value, feature]);
                }
              },
            },
            feature
          )
        )
      ),
    ];
  };

  const Versions = ({ options, onChange, value }) => {
    const i18n = useI18n();
    return e(
      "div",
      { className: "row" },
      e("div", { className: "col-sm-4" }, [
        e("div", { className: "form-group mb-5" }, [
          e("label", { htmlFor: "versions" }, i18n.t("spawner.version")),
          e(
            "select",
            {
              id: "versions",
              className: "form-control input-lg",
              value,
              onChange: (e) => onChange(e.target.value),
            },
            options.map((option) =>
              e("option", { key: option, value: option }, option)
            )
          ),
        ]),
      ])
    );
  };

  const Start = ({
    spawnUrl,
    isStarting,
    onClick,
    workspaceCode,
    resources,
    spawnerGroupId,
    imageTag,
    features,
    profileId,
  }) => {
    const i18n = useI18n();
    return e(
      "form",
      {
        action: spawnUrl,
        method: "POST",
        enctype: "multipart/form-data",
      },
      [
        e("input", {
          type: "hidden",
          name: "workspace_code",
          value: workspaceCode,
        }),
        e("input", { type: "hidden", name: "profile_id", value: profileId }),
        e("input", {
          type: "hidden",
          name: "spawner_group_id",
          value: spawnerGroupId,
        }),
        e("input", {
          type: "hidden",
          name: "image_tag",
          value: imageTag,
        }),
        e("input", {
          type: "hidden",
          name: "resources",
          value: JSON.stringify(resources),
        }),
        e("input", {
          type: "hidden",
          name: "features",
          value: JSON.stringify(features),
        }),
        e("div", { className: "text-center" }, [
          e(
            "button",
            {
              type: "submit",
              className: clsx("btn btn-lg btn-primary easi-spawner__start", {
                hidden: isStarting,
              }),
              onClick,
            },
            i18n.t("spawner.start")
          ),
          isStarting && e("i", { className: "fa fa-spinner fa-spin" }),
        ]),
      ]
    );
  };

  const Logos = ({ tags }) =>
    e(
      "div",
      {},
      _.map(_.intersection(_.keys(logos), tags), (key) =>
        e("img", { src: logos[key], key, className: "easi-spawner__logo" })
      )
    );

  const Profiles = ({ options, value, onChange }) => {
    const numberOfItemsToNotHide = 4;
    const i18n = useI18n();
    const [showAll, setShowAll] = useState(false);
    useEffect(() => {
      setShowAll(
        (current) =>
          current || _.findIndex(options, value) >= numberOfItemsToNotHide
      );
    }, [options, value]);
    const hasMore = options.length > numberOfItemsToNotHide && !showAll;
    return e("div", { className: "mb-5" }, [
      e("div", {}, e("label", {}, i18n.t("spawner.profiles"))),
      e(
        "div",
        { className: "mb-n3" },
        e(
          "div",
          { className: "easi-spawner__profiles row mb-2" },
          _.isEmpty(options)
            ? e(
                "div",
                { className: "col-sm-12" },
                e(
                  "div",
                  { className: "alert alert-danger" },
                  "No profiles available"
                )
              )
            : _.map(
                _.slice(
                  options,
                  0,
                  showAll ? options.length : numberOfItemsToNotHide
                ),
                (profile) =>
                  e(
                    "div",
                    {
                      className: clsx(
                        "easi-spawner__profile col-sm-6 col-md-4 col-lg-3"
                      ),
                      key: profile.display_name,
                      onClick: () => onChange(profile),
                    },
                    e(
                      "div",
                      {
                        role: "button",
                        className: clsx("easi-spawner__profile-body d-flex", {
                          "bg-primary text-white": value === profile,
                        }),
                      },
                      [
                        e(
                          "div",
                          { className: "easi-spawner__profile-body-main" },
                          [
                            e("strong", {}, profile.name),
                            e("hr", { style: { width: "100%" } }),
                            profile.description,
                          ]
                        ),
                        e("hr", { style: { width: "100%" } }),
                        e(
                          "div",
                          { className: "easi-spawner__profile-footer" },
                          [e(Logos, { tags: profile.tags })]
                        ),
                      ]
                    )
                  )
              )
        )
      ),
      hasMore &&
        e(
          "button",
          {
            onClick: () => setShowAll(true),
            className: "btn btn-link",
          },
          i18n.t("spawner.show_more_options")
        ),
    ]);
  };

  const NumberInput = ({ name, value, onChange, min, max }) =>
    e("div", {}, [
      e(
        "label",
        {
          htmlFor: _.kebabCase(`${name}-number`),
        },
        name
      ),
      e("div", { className: "row d-flex align-items-center" }, [
        e(
          "div",
          { className: "col-xs-8" },
          e("input", {
            type: "range",
            min,
            max,
            onChange: (e) => onChange(_.toNumber(e.target.value)),
            value,
          })
        ),
        e(
          "div",
          { className: "col-xs-4" },
          e("input", {
            type: "number",
            className: "form-control input-sm",
            id: _.kebabCase(`${name}-number`),
            value,
            onChange: (e) =>
              onChange(_.clamp(_.toNumber(e.target.value), min, max)),
          })
        ),
      ]),
    ]);

  const CheckboxInput = ({ name, value, onChange }) =>
    e("div", { className: "checkbox mb-0" }, [
      e("label", {}, [
        e("input", {
          type: "checkbox",
          onChange: (e) => onChange(e.target.checked),
          checked: value,
        }),
        name,
      ]),
    ]);

  const ResourcePresets = ({ value, onChange }) => {
    return e(
      "div",
      { className: "btn-group mb-3" },
      resourcePresets.map(({ label, resourcesConfiguration }) =>
        e(
          "button",
          {
            key: label,
            className: clsx("btn btn-lg", {
              "btn-primary": _.isMatch(value, resourcesConfiguration),
              "btn-default": !_.isMatch(value, resourcesConfiguration),
            }),
            onClick: () => onChange({ ...value, ...resourcesConfiguration }),
          },
          label
        )
      )
    );
  };

  const Resource = ({ children }) =>
    e(
      "div",
      { className: "col-sm-6 col-md-3 mb-3" },
      e("div", {
        className: "easi-spawner__resource",
        children,
      })
    );

  const GpuResource = ({ resourcesConfiguration, value, onChange }) => {
    const i18n = useI18n();
    return e(
      Resource,
      {},
      e(NumberInput, {
        name: i18n.t("spawner.gpu"),
        min: _.max([resourcesConfiguration.gpu.count.min, 1]),
        max: resourcesConfiguration.gpu.count.max,
        onChange: (count) =>
          onChange({ ...value, gpu: { ...value.gpu, count } }),
        value: value.gpu.count,
      }),
      e("div", { className: "d-flex align-items-center mt-3" }, [
        e(
          "label",
          {
            htmlFor: "gpu-type",
            className: "mb-0 me-2 fw-normal",
          },
          i18n.t("spawner.type")
        ),
        e(
          "select",
          {
            id: "gpu-type",
            className: "form-control input-sm",
            value: value.gpu.type,
            onChange: (e) =>
              onChange({
                ...value,
                gpu: { ...value.gpu, type: e.target.value },
              }),
          },
          _.map(resourcesConfiguration.gpu.types, ({ label, value }) =>
            e("option", { value }, label)
          )
        ),
      ])
    );
  };

  const Resources = ({ resourcesConfiguration, value, onChange }) => {
    const i18n = useI18n();
    return e("div", { className: "mb-5" }, [
      e("div", {}, e("label", {}, i18n.t("spawner.resources"))),
      e("div", { className: "clearfix" }, [
        e(
          "div",
          { className: "pull-left me-2" },
          e(ResourcePresets, { value, onChange })
        ),
        e(
          "div",
          { className: "pull-left" },
          resourcesConfiguration.gpu.count.max > 0 &&
            CheckboxInput({
              name: "Enable GPU",
              value: value.gpu.count > 0,
              onChange: () =>
                onChange({
                  ...value,
                  gpu: {
                    ...value.gpu,
                    count:
                      value.gpu.count > 0
                        ? 0
                        : _.max([resourcesConfiguration.gpu.count.min, 1]),
                  },
                }),
            })
        ),
      ]),
      e("div", { className: "row d-flex flex-wrap mb-n3" }, [
        e(
          Resource,
          {},
          e(NumberInput, {
            name: i18n.t("spawner.cpu"),
            min: resourcesConfiguration.cpu.min,
            max: resourcesConfiguration.cpu.max,
            onChange: (cpu) => onChange({ ...value, cpu }),
            value: value.cpu,
            unit: "cores",
          })
        ),
        e(
          Resource,
          {},
          e(NumberInput, {
            name: i18n.t("spawner.ram"),
            min: resourcesConfiguration.ram.min,
            max: resourcesConfiguration.ram.max,
            onChange: (ram) => onChange({ ...value, ram }),
            value: value.ram,
          })
        ),
        e(Resource, {}, [
          e(NumberInput, {
            name: i18n.t("spawner.storage"),
            min: resourcesConfiguration.storage.count.min,
            max: resourcesConfiguration.storage.count.max,
            onChange: (count) =>
              onChange({ ...value, storage: { ...value.storage, count } }),
            value: value.storage.count,
          }),
          e(CheckboxInput, {
            name: "Use SSD",
            onChange: (ssd) =>
              onChange({ ...value, storage: { ...value.storage, ssd } }),
            value: value.storage.ssd,
          }),
        ]),
        value.gpu.count > 0 &&
          e(GpuResource, { resourcesConfiguration, value, onChange }),
      ]),
    ]);
  };

  const Spawner = ({
    workspaces,
    profiles,
    messages,
    resourcesConfiguration,
    spawnUrl,
    selected,
  }) => {
    const allFeaturesExceptGpu = _.without(
      _.uniq(_.flatten(_.map(profiles, "tags"))),
      "GPU"
    );
    const initial = getInitialValues({
      workspaces,
      profiles,
      resourcesConfiguration,
      selected,
      allFeatures: allFeaturesExceptGpu,
    });
    const [isStarting, setIsStarting] = useState(false);
    const [selectedFeatures, setSelectedFeatures] = useState(initial.features);
    const [selectedWorkspace, setSelectedWorkspace] = useState(
      initial.workspace
    );
    const [selectedResources, setSelectedResources] = useState(
      initial.resources
    );
    const [selectedProfile, setSelectedProfile] = useState(initial.profile);
    const [selectedVersion, setSelectedVersion] = useState(initial.version);

    const isGpuEnabled = selectedResources.gpu.count > 0;

    const profilesMatchingResources = _.filter(
      profiles,
      (profile) => isGpuEnabled === _.includes(profile.tags, "GPU")
    );

    const availableFeatures = _.uniq(
      _.flatten(_.map(profilesMatchingResources, "tags"))
    );
    const features = _.intersection(availableFeatures, selectedFeatures);

    const profilesMatchingFeatures = _.filter(
      profilesMatchingResources,
      (profile) => _.isEmpty(_.difference(features, profile.tags))
    );

    const availableVersions = _.uniq(
      _.flatten(
        _.map(_.flatten(_.map(profilesMatchingFeatures, "versions")), "label")
      )
    );
    const version = _.includes(availableVersions, selectedVersion)
      ? selectedVersion
      : _.first(availableVersions);

    const availableProfiles = _.filter(profilesMatchingFeatures, (profile) =>
      _.find(profile.versions, { label: version })
    );
    const profile = _.includes(availableProfiles, selectedProfile)
      ? selectedProfile
      : _.first(availableProfiles);

    const hasProfile = !_.isUndefined(profile);
    const resources = _.cloneDeep(selectedResources);
    return e("section", {}, [
      e("div", {
        className: "mb-5",
        dangerouslySetInnerHTML: { __html: messages.allocations },
      }),
      _.isEmpty(workspaces) &&
        e("div", {
          className: "alert alert-danger",
          dangerouslySetInnerHTML: { __html: messages.noAllocations },
        }),
      !_.isEmpty(workspaces) &&
        e("fieldset", { readOnly: isStarting }, [
          e(Workspaces, {
            workspaces,
            onChange: setSelectedWorkspace,
            value: selectedWorkspace,
          }),
          e(Resources, {
            resourcesConfiguration,
            value: resources,
            onChange: setSelectedResources,
          }),
          e("div", { className: "clearfix" }, [
            e(
              "div",
              { className: "pull-left" },
              e(Features, {
                options: availableFeatures,
                value: features,
                onChange: setSelectedFeatures,
              })
            ),
            !_.isEmpty(availableVersions) &&
              e(
                "div",
                {},
                e(Versions, {
                  options: availableVersions,
                  value: version,
                  onChange: setSelectedVersion,
                })
              ),
          ]),
          e(Profiles, {
            options: availableProfiles,
            value: profile,
            onChange: setSelectedProfile,
          }),
        ]),
      !_.isEmpty(workspaces) &&
        hasProfile &&
        e(Start, {
          spawnUrl,
          workspaceCode: selectedWorkspace.code,
          profileId: profile.name,
          resources,
          spawnerGroupId: profile.spawner_group_id,
          imageTag: _.find(profile.versions, { label: version }).tag,
          features,
          isStarting,
          onClick: () => setIsStarting(true),
        }),
    ]);
  };

  const container = document.getElementById("spawner-page-app");
  const root = ReactDOM.createRoot(container);
  root.render(e(I18nProvider, {}, e(Spawner, window.spawnerProps)));
});
