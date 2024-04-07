require(["react", "react-dom", "lodash", "clsx"], function (
  React,
  ReactDOM,
  _,
  clsx
) {
  const { createElement: e, useState } = React;

  const logos = {
    GPU: "/hub/static/extra-assets/images/nvidia-logo.png",
    Python: "/hub/static/extra-assets/images/python-logo.png",
    R: "/hub/static/extra-assets/images/r-logo.png",
  };

  const Workspaces = ({ workspaces, onChange, value }) =>
    e(
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

  const Features = ({ options, value, onChange }) => [
    e("div", {}, e("label", {}, i18n.t("spawner.features"))),
    e(
      "div",
      { className: "btn-group easi-spawner__features mb-5" },
      options.map((feature) =>
        e(
          "button",
          {
            key: feature,
            className: clsx("btn btn-lg easi-spawner__features-item ", {
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

  const Start = ({
    spawnUrl,
    isStarting,
    onClick,
    workspaceCode,
    resources,
    spawnerGroupId,
    profileId,
    disabled,
  }) =>
    e(
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
          name: "resources",
          value: JSON.stringify(resources),
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
            "Start"
          ),
          isStarting && e("i", { className: "fa fa-spinner fa-spin" }),
        ]),
      ]
    );

  const Logos = ({ tags }) =>
    e(
      "div",
      {},
      _.map(_.intersection(_.keys(logos), tags), (key) =>
        e("img", { src: logos[key], key, className: "easi-spawner__logo" })
      )
    );

  const Profiles = ({ options, value, onChange }) => [
    e("div", {}, e("label", {}, i18n.t("spawner.profiles"))),
    e(
      "div",
      { className: "easi-spawner__profiles mb-5 row" },
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
        : _.map(options, (profile) =>
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
                  e("div", { className: "easi-spawner__profile-body-main" }, [
                    e("strong", {}, profile.name),
                    e("hr", { style: { width: "100%" } }),
                    profile.description,
                  ]),
                  e("hr", { style: { width: "100%" } }),
                  e("div", { className: "easi-spawner__profile-footer" }, [
                    e("small", {}, e("strong", {}, profile.version)),
                    e(Logos, { tags: profile.tags }),
                  ]),
                ]
              )
            )
          )
    ),
  ];

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

  const Resource = ({ children }) =>
    e(
      "div",
      { className: "col-sm-6 col-md-3 mb-3" },
      e("div", { className: "easi-spawner__resource", children })
    );

  const Resources = ({ resourcesConfiguration, value, onChange }) => {
    return e("div", { className: "mb-5" }, [
      e("div", {}, e("label", {}, i18n.t("spawner.resources"))),
      e("div", { className: "row d-flex flex-wrap" }, [
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
  }) => {
    const features = _.uniq(_.flatten(_.map(profiles, "tags")));
    const [isStarting, setIsStarting] = useState(false);
    const [selectedFeatures, setSelectedFeatures] = useState([]);
    const [selectedWorkspace, setSelectedWorkspace] = useState(
      _.first(workspaces)
    );
    const [selectedResources, setSelectedResources] = useState({
      cpu: resourcesConfiguration.cpu.default,
      gpu: {
        count: resourcesConfiguration.gpu.count.default,
        type: _.first(resourcesConfiguration.gpu.types).value,
      },
      ram: resourcesConfiguration.ram.default,
      storage: {
        count: resourcesConfiguration.storage.count.default,
        ssd: _.first(resourcesConfiguration.storage.ssd),
      },
    });
    const [selectedProfile, setSelectedProfile] = useState(_.first(profiles));
    const availableProfiles = _.filter(profiles, ({ tags }) =>
      _.isEmpty(_.difference(selectedFeatures, tags))
    );
    const profile = _.includes(availableProfiles, selectedProfile)
      ? selectedProfile
      : _.first(availableProfiles);
    const hasProfile = !_.isUndefined(profile);
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
          e("div", { className: "row" }, [
            e(
              "div",
              { className: "col-md-8" },
              e(Features, {
                options: features,
                value: selectedFeatures,
                onChange: setSelectedFeatures,
              })
            ),
          ]),
          e(Profiles, {
            options: availableProfiles,
            value: profile,
            onChange: setSelectedProfile,
          }),
          e(Resources, {
            resourcesConfiguration,
            value: resources,
            onChange: setSelectedResources,
          }),
        ]),
      !_.isEmpty(workspaces) &&
        e(Start, {
          spawnUrl,
          workspaceCode: _.get(selectedWorkspace, "code"),
          profileId: _.get(profile, "profile_id"),
          resources,
          spawnerGroupId: _.get(profile, "spawner_group_id"),
          isStarting,
          disabled: !hasProfile,
          onClick: () => setIsStarting(true),
        }),
    ]);
  };

  const container = document.getElementById("spawner-page-app");
  const root = ReactDOM.createRoot(container);
  easiI18n.onLoad(() => {
    root.render(e(Spawner, window.spawnerProps));
  });
});
