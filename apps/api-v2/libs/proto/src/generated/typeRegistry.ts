// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.6.0
//   protoc               v3.20.3

/* eslint-disable */
import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";

export interface MessageType<Message extends UnknownMessage = UnknownMessage> {
  $type: Message["$type"];
  encode(message: Message, writer?: BinaryWriter): BinaryWriter;
  decode(input: BinaryReader | Uint8Array, length?: number): Message;
}

export type UnknownMessage = { $type: string };

export const messageTypeRegistry = new Map<string, MessageType>();
