export default class WorkspaceProvider {
	static QUERY_PARAM_EMPTY_WINDOW = 'ew';
	static QUERY_PARAM_FOLDER = 'folder';
	static QUERY_PARAM_WORKSPACE = 'workspace';

	static QUERY_PARAM_PAYLOAD = 'payload';

	constructor(
		public readonly workspace: any,
		public readonly payload: object
	) { }

	async open(workspace: any, options?: { reuse?: boolean, payload?: object }): Promise<void> {
		if (options.reuse && !options.payload && this.isSame(this.workspace, workspace)) {
			return; // return early if workspace and environment is not changing and we are reusing window
		}

		const targetHref = this.createTargetUrl(workspace, options);
		if (targetHref) {
			if (options.reuse) {
				window.location.href = targetHref;
			} else {
        window.open(targetHref);
			}
		}
	}

	private createTargetUrl(workspace: any, options?: { reuse?: boolean, payload?: object }): string | undefined {

		// Empty
		let targetHref: string | undefined = undefined;
		if (!workspace) {
			targetHref = `${document.location.origin}${document.location.pathname}?${WorkspaceProvider.QUERY_PARAM_EMPTY_WINDOW}=true`;
		}

		// // Folder
		// else if (isFolderToOpen(workspace)) {
		// 	targetHref = `${document.location.origin}${document.location.pathname}?${WorkspaceProvider.QUERY_PARAM_FOLDER}=${encodeURIComponent(workspace.folderUri.toString())}`;
		// }

		// // Workspace
		// else if (isWorkspaceToOpen(workspace)) {
		// 	targetHref = `${document.location.origin}${document.location.pathname}?${WorkspaceProvider.QUERY_PARAM_WORKSPACE}=${encodeURIComponent(workspace.workspaceUri.toString())}`;
		// }

		// Append payload if any
		if (options.payload) {
			targetHref += `&${WorkspaceProvider.QUERY_PARAM_PAYLOAD}=${encodeURIComponent(JSON.stringify(options.payload))}`;
		}

		return targetHref;
	}

	private isSame(workspaceA: any, workspaceB: any): boolean {
		if (!workspaceA || !workspaceB) {
			return workspaceA === workspaceB; // both empty
		}

		// if (isFolderToOpen(workspaceA) && isFolderToOpen(workspaceB)) {
		// 	return isEqual(workspaceA.folderUri, workspaceB.folderUri); // same workspace
		// }

		// if (isWorkspaceToOpen(workspaceA) && isWorkspaceToOpen(workspaceB)) {
		// 	return isEqual(workspaceA.workspaceUri, workspaceB.workspaceUri); // same workspace
		// }

		return false;
	}
}