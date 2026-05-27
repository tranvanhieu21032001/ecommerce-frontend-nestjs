export type GoogleCredentialResponse = {
  credential: string;
};

type GoogleButtonOptions = {
  type: "icon";
  shape: "circle";
  theme: "outline";
  size: "large";
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: GoogleButtonOptions,
          ) => void;
        };
      };
    };
  }
}
