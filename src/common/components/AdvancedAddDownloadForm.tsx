import * as React from "react";
import last from "lodash-es/last";
import { ApiClient, isConnectionFailure } from "synology-typescript-api";
import classNames from "classnames";
import TextareaAutosize from "react-textarea-autosize";

import { PathSelector } from "./PathSelector";
import { startsWithAnyProtocol, ALL_DOWNLOADABLE_PROTOCOLS } from "../apis/protocols";
import type { AddTaskOptions } from "../apis/messages";

export interface Props {
  client: ApiClient;
  onAddDownload: (urls: string[], options: AddTaskOptions) => void;
  onCancel: () => void;
}

export interface State {
  selectedPath: string | undefined;
  downloadUrl: string;
  ftpUsername: string;
  ftpPassword: string;
  unzipPassword: string;
  unzipEnabled: boolean;
}

export class AdvancedAddDownloadForm extends React.PureComponent<Props, State> {
  state: State = {
    selectedPath: undefined,
    downloadUrl: "",
    ftpUsername: "",
    ftpPassword: "",
    unzipPassword: "",
    unzipEnabled: true,
  };

  async componentDidMount() {
    try {
      const config = await this.props.client.DownloadStation.Info.GetConfig();
      if (isConnectionFailure(config) || !config.success) {
        this.setState({ unzipEnabled: false });
      } else {
        this.setState({ unzipEnabled: config.data.unzip_service_enabled });
      }
    } catch (e) {
      this.setState({ unzipEnabled: false });
    }
  }

  render() {
    const hasDownloadUrl = this.state.downloadUrl.length > 0;

    return (
      <div className="advanced-add-download-form">
        <TextareaAutosize
          className="url-input input-field card"
          minRows={2}
          maxRows={5}
          value={this.state.downloadUrl}
          onChange={(e) => {
            this.setState({ downloadUrl: e.currentTarget.value });
          }}
          placeholder={browser.i18n.getMessage("URLs_to_download_one_per_line")}
        />
        <div className="sibling-inputs">
          <input
            type="text"
            className="input-field"
            value={this.state.ftpUsername}
            onChange={(e) => {
              this.setState({ ftpUsername: e.currentTarget.value });
            }}
            placeholder={browser.i18n.getMessage("FTP_username")}
          />
          <input
            type="password"
            className="input-field"
            value={this.state.ftpPassword}
            onChange={(e) => {
              this.setState({ ftpPassword: e.currentTarget.value });
            }}
            placeholder={browser.i18n.getMessage("FTP_password")}
          />
        </div>
        <input
          type="password"
          className="input-field"
          value={this.state.unzipPassword}
          onChange={(e) => {
            this.setState({ unzipPassword: e.currentTarget.value });
          }}
          disabled={!this.state.unzipEnabled}
          title={
            this.state.unzipEnabled
              ? undefined
              : browser.i18n.getMessage("Auto_Extract_service_is_disabled_in_Download_Station")
          }
          placeholder={browser.i18n.getMessage("Unzip_password")}
        />
        <div className="download-path card">
          <div className="path-display" title={this.state.selectedPath}>
            {browser.i18n.getMessage("Download_to")}
            <span className={classNames("path", { faded: !this.state.selectedPath })}>
              {this.state.selectedPath
                ? last(this.state.selectedPath.split("/"))
                : browser.i18n.getMessage("default_location")}
            </span>
          </div>
          <PathSelector
            client={this.props.client}
            onSelectPath={this.setSelectedPath}
            selectedPath={this.state.selectedPath}
          />
        </div>
        <div className="buttons">
          <button
            onClick={this.props.onCancel}
            title={browser.i18n.getMessage("Dont_add_a_new_task")}
          >
            <span className="fa fa-lg fa-times" /> {browser.i18n.getMessage("Cancel")}
          </button>
          <button
            onClick={this.addDownload}
            title={browser.i18n.getMessage("Download_the_above_URL_to_the_specified_location")}
            disabled={!hasDownloadUrl}
            className={classNames({ disabled: !hasDownloadUrl })}
          >
            <span className="fa fa-lg fa-plus" /> {browser.i18n.getMessage("Add")}
          </button>
        </div>
      </div>
    );
  }

  private addDownload = () => {
    let urls = this.state.downloadUrl
      .split("\n")
      .map((url) => url.trim())
      // The cheapest of checks. Actual invalid URLs will be caught later.
      .filter((url) => startsWithAnyProtocol(url, ALL_DOWNLOADABLE_PROTOCOLS));
    this.props.onAddDownload(urls, {
      path: this.state.selectedPath,
      ftpPassword: this.state.ftpPassword.trim() || undefined,
      ftpUsername: this.state.ftpUsername.trim() || undefined,
      unzipPassword: this.state.unzipPassword.trim() || undefined,
    });
  };

  private setSelectedPath = (selectedPath: string | undefined) => {
    this.setState({ selectedPath });
  };
}
