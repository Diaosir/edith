import React, { useState } from 'react'
import Icon from '@/components/icons';
import { FileType } from 'edith-types/lib/file'
import PostAdd from '@material-ui/icons/PostAdd';
import CreateNewFolder from '@material-ui/icons/CreateNewFolder';
import Refresh from '@material-ui/icons/Refresh';
interface Props {
  type?: FileType;
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
  return (
    <div className="file-control">
      <div className="file-control-item" onClick={addFile}>
        <PostAdd ></PostAdd>
      </div>
      <div className="file-control-item" onClick={addFolder}>
        <CreateNewFolder></CreateNewFolder>
      </div>
      <div className="file-control-item" onClick={handleDelete}>
        <Refresh></Refresh>
      </div>
    </div>
  )

}