export interface ServiceDefinition {
  service: string;
  methods: {
    [key: string]: {
      path: string;
      requestStream: boolean;
      responseStream: boolean;
      requestType: any;
      responseType: any;
    };
  };
}
