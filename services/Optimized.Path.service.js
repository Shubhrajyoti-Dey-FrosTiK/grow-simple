import OptimizedPlottingService from "./Optimized.Plotting.service";

export default class OptimizedPathService {
  PLOT = new OptimizedPlottingService();

  async filterNDeliveries(paths, time) {
    const filteredDeliveries = [];
    console.log(paths, time);

    paths.forEach((path) => {
      const tempDeliveries = [];
      for (let stepIndex = 0; stepIndex < path.length; stepIndex++) {
        if (path[stepIndex].duration <= time) {
          tempDeliveries.push(path[stepIndex]);
        } else break;
      }

      filteredDeliveries.push(tempDeliveries);
    });

    return filteredDeliveries;
  }
}