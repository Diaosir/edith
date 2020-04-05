import React, { useState } from 'react'
import Icon from '@/components/icons';
import { FileType } from 'edith-types/lib/file'
interface Props {
  type: FileType;
  onAddFolder?: Function;
  onEdit?: Function;
  onAddFile?: Function;
  onDelete?: Function;
}
export default function Controller({ type, onAddFile, onAddFolder, onDelete, onEdit }: Props) {
  function handleEdit(e) {
    e.stopPropagation();
    typeof onEdit === 'function' && onEdit()
  }
  function addFolder(e) {
    e.stopPropagation()
    typeof onAddFolder === 'function' && onAddFolder()
  }
  function addFile(e) {
    e.stopPropagation();
    typeof onAddFile === 'function' && onAddFile()
  }
  function handleDelete(e) {
    e.stopPropagation();
    typeof onDelete === 'function' && onDelete()
  }
  if (FileType.FOLDER === type) {
    return (
      <div className="file-control">
        <div className="file-control-item" onClick={addFile}>
          <Icon type="file-add"/>
        </div>
        <div className="file-control-item" onClick={addFolder}>
          <Icon type="folder-add"/>
        </div>
        <div className="file-control-item" onClick={handleDelete}>
          <Icon type="close"/>
        </div>
      </div>
    )
  } else {
    return (
      <div className="file-control">
        <div className="file-control-item" onClick={handleEdit}>
          <Icon type="edit"/>
        </div>
        <div className="file-control-item" onClick={handleDelete}>
          <Icon type="close"/>
        </div>
      </div>
    )
  }

}