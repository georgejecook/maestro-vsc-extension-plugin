import { BrsFile, ClassStatement, ParseMode, SourceObj, XmlFile } from 'brighterscript';

import { getAlternateFileNames } from '../utils/Utils';
import { File } from './File';
import { FileType } from './FileType';

import { addProjectFileMapErrorDuplicateXMLComp } from '../utils/Diagnostics';
import { NodeClass } from '../node-classes/NodeClass';

export class ProjectFileMap {

  constructor() {
    this.allFiles = new Map<string, File>();
    this.allXMLComponentFiles = new Map<string, File>();
    this.allClassNames = new Set<string>();
  }

  public allClasses = new Map<string, ClassStatement>();
  public allClassNames: Set<string>;
  public allClassFiles = new Map<string, File>();
  public allXMLComponentFiles: Map<string, File>;
  public allFiles: Map<string, File>;
  public nodeClasses = new Map<string, NodeClass>();
  public nodeClassesByPath = new Map<string, NodeClass[]>();

  get XMLComponentNames(): string[] {
    return [...this.allXMLComponentFiles.keys()];
  }

  get files(): File[] {
    return [...this.allFiles.values()];
  }

  get classNames(): string[] {
    return [...this.allClassNames.values()];
  }

  public addXMLComponent(file: File) {
    if (file.fileType === FileType.Xml) {
      if (!this.allXMLComponentFiles.has(file.componentName) || file.fullPath === this.allXMLComponentFiles.get(file.componentName).fullPath) {
        this.allXMLComponentFiles.set(file.componentName, file);
      } else {
        const duplicateFile = this.allXMLComponentFiles.get(file.componentName);
        addProjectFileMapErrorDuplicateXMLComp(file, duplicateFile.fullPath);
      }
    }
  }

  public addClass(classStatement: ClassStatement, mFile: File) {
    let className = classStatement.getName(ParseMode.BrighterScript);
    this.allClassNames.add(className);
    this.allClassFiles.set(className, mFile);
    this.allClasses.set(className, classStatement);
    mFile.classNames.add(className);
  }

  public removeClass(name: string) {
    this.allClassNames.delete(name);
    this.allClassFiles.delete(name);
    this.allClasses.delete(name);
  }

  public removeFileClasses(file: File) {
    for (let name of [...file.classNames.values()]) {
      this.removeClass(name);
    }
    file.classNames = new Set();
  }

  public removeFile(file: File) {
    this.removeFileClasses(file);
    this.allFiles.delete(file.fullPath);
  }

  public getFileForClass(className: string) {
    if (this.allClasses.has(className)) {
      return this.allClassFiles.get(className);
    }
    return undefined;
  }

  public addFile(file: File) {
    this.removeFile(file);
    this.allFiles.set(file.fullPath, file);
    const alternatePaths = getAlternateFileNames(file.fullPath);
    let alternateFile;
    for (let p of alternatePaths) {
      alternateFile = this.allFiles.get(p);
      if (alternateFile) {
        file.associatedFile = alternateFile;
        alternateFile.associatedFile = file;
        break;
      }
    }
  }

  public addBscFiles(files: { [filePath: string]: BrsFile | XmlFile }) {
    for (let filePath in files) {
      let bscFile = files[filePath];
      let file = this.allFiles.get(bscFile.pathAbsolute);
      if (file) {
        file.bscFile = bscFile;
      }
    }
  }

  getFile(source: SourceObj): File {
    // let file = this.allFiles.get(source.pathAbsolute);
    // if (!file || file.fileType === FileType.Xml) {
    //   file = new File(source.pathAbsolute, source.source);
    //   file.fileMap = this;
    // }
    let file = new File(source.pathAbsolute, source.source);
    file.fileMap = this;
    this.addFile(file);
    return file;
  }
}