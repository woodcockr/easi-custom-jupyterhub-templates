require(["react", "react-dom", "lodash", "clsx", "easi-i18n"], function (
  React,
  ReactDOM,
  _,
  clsx,
  { useI18n, I18nProvider }
) {
  const { createElement: e, useState } = React;

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
        gpu: {
          count: 0,
          type: "v100",
        },
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
        gpu: {
          count: 2,
          type: "v100",
        },
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
        gpu: {
          count: 8,
          type: "v100",
        },
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
  }) => {
    const workspace = _.defaultTo(
      _.find(workspaces, { code: _.get(selected, "workspace_code") }),
      _.first(workspaces)
    );
    const profile = _.defaultTo(
      _.find(profiles, { name: _.get(selected, "profile_id") }),
      _.first(profiles)
    );
    const version = _.defaultTo(
      _.find(profile.versions, { tag: _.get(selected, "image_tag") }),
      _.first(profile.versions)
    );
    const resources = getInitialResourcesValue({
      resourcesConfiguration,
      selected,
    });
    const features = _.defaultTo(_.get(selected, "features"), []);
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
              value: value.tag,
              onChange: (e) =>
                onChange(_.find(options, { tag: e.target.value })),
            },
            options.map(({ label, tag }) =>
              e("option", { key: tag, value: tag }, label)
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
    disabled,
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
              disabled,
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
    const i18n = useI18n();
    const [showAll, setShowAll] = useState(false);
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
                _.slice(options, 0, showAll ? options.length : 4),
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
      options.length > 4 &&
        e(
          "button",
          {
            onClick: () => setShowAll(!showAll),
            className: "btn btn-link",
          },
          i18n.t(
            showAll ? "spawner.show_less_options" : "spawner.show_more_options"
          )
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
              "btn-primary": _.isEqual(value, resourcesConfiguration),
              "btn-default": !_.isEqual(value, resourcesConfiguration),
            }),
            onClick: () => onChange(resourcesConfiguration),
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

  const Resources = ({ resourcesConfiguration, value, onChange }) => {
    const i18n = useI18n();
    return e("div", { className: "mb-5" }, [
      e("div", {}, e("label", {}, i18n.t("spawner.resources"))),
      e(ResourcePresets, { value, onChange }),
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
        e(
          Resource,
          {},
          e(NumberInput, {
            name: i18n.t("spawner.gpu"),
            min: resourcesConfiguration.gpu.count.min,
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
              [e("option", { value: "v100" }, "NVIDIA Tesla V100")]
            ),
          ])
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
    const features = _.uniq(_.flatten(_.map(profiles, "tags")));
    const initial = getInitialValues({
      workspaces,
      profiles,
      resourcesConfiguration,
      selected,
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
    const availableProfiles = _.filter(profiles, ({ tags }) =>
      _.isEmpty(_.difference(selectedFeatures, tags))
    );
    const profile = _.includes(availableProfiles, selectedProfile)
      ? selectedProfile
      : _.first(availableProfiles);
    const hasProfile = !_.isUndefined(profile);
    const versions = profile.versions;
    const version = _.includes(versions, selectedVersion)
      ? selectedVersion
      : _.first(profile.versions);
    const resources = _.cloneDeep(selectedResources);
    if (_.includes(profile.tags, "GPU")) {
      resources.gpu.count = resources.gpu.count || 1;
    }
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
          e(Features, {
            options: features,
            value: selectedFeatures,
            onChange: setSelectedFeatures,
          }),
          e(Profiles, {
            options: availableProfiles,
            value: profile,
            onChange: setSelectedProfile,
          }),
          e(Versions, {
            options: versions,
            value: version,
            onChange: setSelectedVersion,
          }),
        ]),
      !_.isEmpty(workspaces) &&
        e(Start, {
          spawnUrl,
          workspaceCode: _.get(selectedWorkspace, "code"),
          profileId: _.get(profile, "name"),
          resources,
          spawnerGroupId: _.get(profile, "spawner_group_id"),
          imageTag: _.get(version, "tag"),
          features: selectedFeatures,
          isStarting,
          disabled: !hasProfile,
          onClick: () => setIsStarting(true),
        }),
    ]);
  };

  const container = document.getElementById("spawner-page-app");
  const root = ReactDOM.createRoot(container);
  root.render(e(I18nProvider, {}, e(Spawner, window.spawnerProps)));
});
