import fs from 'fs';

// Read the backup data
const backupData = JSON.parse(fs.readFileSync('data_backup_20250903_165942.json', 'utf8'));

// Transform each use case to use only multi-select fields
const transformedUseCases = backupData.useCases.map(useCase => {
  const transformed = { ...useCase };
  
  // Convert single fields to arrays, combining with existing arrays if present
  
  // Processes: combine single 'process' with 'processes' array
  const processes = [];
  if (useCase.process) processes.push(useCase.process);
  if (useCase.processes && Array.isArray(useCase.processes)) {
    useCase.processes.forEach(p => {
      if (!processes.includes(p)) processes.push(p);
    });
  }
  transformed.processes = processes;
  
  // Lines of Business: combine single with array
  const linesOfBusiness = [];
  if (useCase.lineOfBusiness) linesOfBusiness.push(useCase.lineOfBusiness);
  if (useCase.linesOfBusiness && Array.isArray(useCase.linesOfBusiness)) {
    useCase.linesOfBusiness.forEach(lob => {
      if (!linesOfBusiness.includes(lob)) linesOfBusiness.push(lob);
    });
  }
  transformed.linesOfBusiness = linesOfBusiness;
  
  // Business Segments: combine single with array
  const businessSegments = [];
  if (useCase.businessSegment) businessSegments.push(useCase.businessSegment);
  if (useCase.businessSegments && Array.isArray(useCase.businessSegments)) {
    useCase.businessSegments.forEach(bs => {
      if (!businessSegments.includes(bs)) businessSegments.push(bs);
    });
  }
  transformed.businessSegments = businessSegments;
  
  // Geographies: combine single with array
  const geographies = [];
  if (useCase.geography) geographies.push(useCase.geography);
  if (useCase.geographies && Array.isArray(useCase.geographies)) {
    useCase.geographies.forEach(geo => {
      if (!geographies.includes(geo)) geographies.push(geo);
    });
  }
  transformed.geographies = geographies;
  
  // Activities: combine single with array
  const activities = [];
  if (useCase.activity) activities.push(useCase.activity);
  if (useCase.activities && Array.isArray(useCase.activities)) {
    useCase.activities.forEach(act => {
      if (!activities.includes(act)) activities.push(act);
    });
  }
  transformed.activities = activities;
  
  // Remove the legacy single fields
  delete transformed.process;
  delete transformed.lineOfBusiness;
  delete transformed.businessSegment;
  delete transformed.geography;
  delete transformed.activity;
  delete transformed.valueChainComponent;
  
  return transformed;
});

// Create transformed backup
const transformedData = {
  ...backupData,
  useCases: transformedUseCases,
  transformedAt: new Date().toISOString()
};

fs.writeFileSync('data_transformed.json', JSON.stringify(transformedData, null, 2));
console.log(`Transformed ${transformedUseCases.length} use cases`);
console.log('Saved to data_transformed.json');