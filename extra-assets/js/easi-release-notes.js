require(["react", "react-dom", "lodash", "clsx"], function (React, ReactDOM) {
  const { createElement: e, Fragment, useState } = React;

  function EasiReleaseNotes({ releaseNotes }) {
    const [showModal, setShowModal] = useState(false);
    const handleClose = () => setShowModal(false);
    const handleShow = () => setShowModal(true);
    return e(Fragment, {
      children: [
        e("a", {
          role: "button",
          onClick: handleShow,
          children: "Release notes",
        }),
        showModal &&
          e("div", {
            className: "modal",
            style: {
              display: "block",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            },
            children: e("div", {
              className: "modal-dialog modal-lg",
              children: e("div", {
                className: "modal-content",
                children: [
                  e("div", {
                    className: "modal-header",
                    children: [
                      e("button", {
                        type: "button",
                        className: "close",
                        onClick: handleClose,
                        children: "\xD7",
                      }),
                      e("h4", {
                        className: "modal-title",
                        children: "Release notes",
                      }),
                    ],
                  }),
                  e("div", {
                    className: "modal-body",
                    dangerouslySetInnerHTML: { __html: releaseNotes },
                  }),
                  e("div", {
                    className: "modal-footer",
                    children: e("button", {
                      type: "button",
                      className: "btn btn-default",
                      onClick: handleClose,
                      children: "Close",
                    }),
                  }),
                ],
              }),
            }),
          }),
      ],
    });
  }

  const container = document.getElementById("release-notes-app");
  const root = ReactDOM.createRoot(container);
  root.render(e(EasiReleaseNotes, { releaseNotes: window.easiReleaseNotes }));
});
