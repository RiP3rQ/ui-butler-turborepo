export interface ServiceDefinition {
  service: string;
  methods: Record<
    string,
    {
      path: string;
      requestStream: boolean;
      responseStream: boolean;
      requestType: any;
      responseType: any;
    }
  >;
}
