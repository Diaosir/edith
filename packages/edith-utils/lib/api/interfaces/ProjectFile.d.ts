interface ProjectFile {
  name: string,
  path: string,
  value: string,
  children?: Array<ProjectFile>
}