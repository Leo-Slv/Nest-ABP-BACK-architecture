# Diagrama de Classe de Implementação / Persistência / ORM

Este diagrama representa a visão técnica atual do projeto: controllers, use cases, factories de repositório, repositórios SQL concretos, mappers, `UnitOfWork`, dispatcher de eventos e os modelos persistidos definidos no `schema.prisma`. O fluxo principal foi detalhado com Leads, e os demais módulos aparecem como a mesma estratégia arquitetural já implementada.

```mermaid
---
config:
  layout: elk
---
classDiagram
direction TB
    class AggregateRoot {
	    -DomainEvent[] _domainEvents
	    +getDomainEvents() DomainEvent[]
	    +clearEvents() void
    }

    class DomainEvent {
	    +occurredAt: Date
    }

    class Specification {
	    +isSatisfiedBy(candidate: T) boolean
    }

    class IUnitOfWork {
	    +begin() Promise~void~
	    +commit() Promise~void~
	    +rollback() Promise~void~
	    +getTransactionContext() TransactionContext
    }

    class TransactionContext {
	    +client: object
    }

    class UnitOfWork {
	    -transactionContext: TransactionContext
	    +begin() Promise~void~
	    +commit() Promise~void~
	    +rollback() Promise~void~
	    +getTransactionContext() TransactionContext
    }

    class Name {
	    -_value: string
	    +value: string
    }

    class Email {
	    -_value: string
	    +value: string
    }

    class Phone {
	    -_value: string
	    +value: string
    }

    class PasswordHash {
	    -_value: string
	    +value: string
    }

    class LeadSource {
	    -_value: string
	    +value: string
    }

    class CloseReason {
	    -_value: string
	    +value: string
    }

    class UserRole {
	    ATTENDANT
	    MANAGER
	    GENERAL_MANAGER
	    ADMINISTRATOR
    }

    class LeadStatus {
	    NEW
	    CONTACTED
	    QUALIFIED
	    DISQUALIFIED
	    CONVERTED
    }

    class DealStatus {
	    OPEN
	    WON
	    LOST
    }

    class DealStage {
	    INITIAL_CONTACT
	    NEGOTIATION
	    PROPOSAL
	    CLOSING
    }

    class DealImportance {
	    COLD
	    WARM
	    HOT
    }

    class AuditActionType {
	    LOGIN
	    CREATE
	    UPDATE
	    DELETE
	    STATUS_CHANGE
	    STAGE_CHANGE
    }

    class User {
	    +id: UUID
	    +name: Name
	    +email: Email
	    +passwordHash: PasswordHash
	    +role: UserRole
	    +teamId: int?
	    +changeName(name: Name) void
	    +changeEmail(email: Email) void
	    +changePassword(passwordHash: PasswordHash) void
	    +assignToTeam(teamId: int) void
	    +changeRole(role: UserRole) void
    }

    class Team {
	    +id: int
	    +name: Name
	    +managerId: UUID?
	    +changeName(name: Name) void
	    +assignManager(userId: UUID) void
    }

    class Store {
	    +id: int
	    +name: Name
	    +changeName(name: Name) void
    }

    class Customer {
	    +id: UUID
	    +name: Name
	    +email: Email?
	    +phone: Phone?
	    +changeName(name: Name) void
	    +changeEmail(email: Email?) void
	    +changePhone(phone: Phone?) void
    }

    class Lead {
	    +id: UUID
	    +customerId: UUID
	    +storeId: int
	    +ownerUserId: UUID
	    +source: LeadSource
	    +status: LeadStatus
	    +changeSource(source: LeadSource) void
	    +changeStatus(status: LeadStatus) void
	    +reassignOwner(userId: UUID) void
	    +assignToStore(storeId: int) void
	    +convert() void
    }

    class Deal {
	    +id: UUID
	    +leadId: UUID
	    +status: DealStatus
	    +stage: DealStage
	    +importance: DealImportance
	    +closeReason: CloseReason?
	    +setImportance(importance: DealImportance) void
	    +markAsOpen() void
	    +changeStage(stage: DealStage) void
	    +changeStatus(status: DealStatus) void
	    +close(reason: CloseReason) void
    }

    class DealHistory {
	    +id: int
	    +dealId: UUID
	    +changedByUserId: UUID
	    +previousStatus: DealStatus?
	    +newStatus: DealStatus?
	    +previousStage: DealStage?
	    +newStage: DealStage?
	    +changedAt: Date
    }

    class AuditLog {
	    +id: hash
	    +actorUserId: UUID
	    +actionType: AuditActionType
	    +entityName: string
	    +entityId: string
	    +createdAt: Date
    }

    class IUserRepository {
	    +create(user: User) Promise~User~
	    +update(user: User) Promise~User~
	    +delete(id: UUID) Promise~void~
	    +findById(id: UUID) Promise~User?~
	    +findByEmail(email: string) Promise~User?~
	    +list() Promise~User[]~
    }

    class ITeamRepository {
	    +create(team: Team) Promise~Team~
	    +update(team: Team) Promise~Team~
	    +delete(id: int) Promise~void~
	    +findById(id: int) Promise~Team?~
	    +list() Promise~Team[]~
    }

    class IStoreRepository {
	    +create(store: Store) Promise~Store~
	    +update(store: Store) Promise~Store~
	    +delete(id: int) Promise~void~
	    +findById(id: int) Promise~Store?~
	    +list() Promise~Store[]~
    }

    class ICustomerRepository {
	    +create(customer: Customer) Promise~Customer~
	    +update(customer: Customer) Promise~Customer~
	    +delete(id: UUID) Promise~void~
	    +findById(id: UUID) Promise~Customer?~
	    +findByEmail(email: string) Promise~Customer?~
	    +list() Promise~Customer[]~
    }

    class ILeadRepository {
	    +create(lead: Lead) Promise~Lead~
	    +update(lead: Lead) Promise~Lead~
	    +delete(id: UUID) Promise~void~
	    +findById(id: UUID) Promise~Lead?~
	    +listByOwner(userId: UUID) Promise~Lead[]~
	    +listByTeam(teamId: int) Promise~Lead[]~
    }

    class IDealRepository {
	    +create(deal: Deal) Promise~Deal~
	    +update(deal: Deal) Promise~Deal~
	    +delete(id: UUID) Promise~void~
	    +findById(id: UUID) Promise~Deal?~
	    +findActiveByLeadId(leadId: UUID) Promise~Deal?~
	    +list() Promise~Deal[]~
    }

    class IAuditLogRepository {
	    +create(log: AuditLog) Promise~AuditLog~
	    +list() Promise~AuditLog[]~
    }

    class LeadFactory {
	    +create(input: CreateLeadInput) Lead
    }

    class CustomerFactory {
	    +create(input: CreateCustomerInput) Customer
    }

    class DealFactory {
	    +create(input: CreateDealInput) Deal
    }

    class UserFactory {
	    +create(input: CreateUserInput) User
    }

    class UserEmailUniqueSpec {
	    +isSatisfiedBy(email: Email, excludeUserId: UUID?) Promise~boolean~
    }

    class CustomerEmailUniqueSpec {
	    +isSatisfiedBy(email: Email, excludeCustomerId: UUID?) Promise~boolean~
    }

    class SingleActiveDealPerLeadSpec {
	    +isSatisfiedBy(leadId: UUID, excludeDealId: UUID?) Promise~boolean~
    }

    class LeadController {
	    +create(input: CreateLeadDto) Promise~LeadResponseDto~
	    +update(id: UUID, input: UpdateLeadDto) Promise~LeadResponseDto~
	    +findById(id: UUID) Promise~LeadResponseDto~
	    +listOwn(ownerUserId: UUID) Promise~LeadResponseDto[]~
	    +listTeam(teamId: int) Promise~LeadResponseDto[]~
	    +reassign(id: UUID, ownerUserId: UUID) Promise~LeadResponseDto~
	    +convert(id: UUID) Promise~LeadResponseDto~
	    +delete(id: UUID) Promise~void~
    }

    class CreateLeadUseCase {
	    +execute(input: CreateLeadDto) Promise~Lead~
    }

    class UpdateLeadUseCase {
	    +execute(id: UUID, input: UpdateLeadDto) Promise~Lead~
    }

    class FindLeadUseCase {
	    +execute(id: UUID) Promise~Lead?~
    }

    class ListOwnLeadsUseCase {
	    +execute(ownerUserId: UUID) Promise~Lead[]~
    }

    class ListTeamLeadsUseCase {
	    +execute(teamId: int) Promise~Lead[]~
    }

    class ReassignLeadUseCase {
	    +execute(id: UUID, ownerUserId: UUID) Promise~Lead~
    }

    class ConvertLeadUseCase {
	    +execute(id: UUID) Promise~Lead~
    }

    class DeleteLeadUseCase {
	    +execute(id: UUID) Promise~void~
    }

    class LeadMapper {
	    +toDomain(row: LeadRow) Lead
	    +toPersistence(lead: Lead) LeadPersistence
	    +toResponse(lead: Lead) LeadResponseDto
    }

    class CreateLeadDto {
	    +customerId: UUID
	    +storeId: int
	    +ownerUserId: UUID
	    +source: string
    }

    class UpdateLeadDto {
	    +storeId: int?
	    +ownerUserId: UUID?
	    +source: string?
	    +status: LeadStatus?
    }

    class LeadResponseDto {
	    +id: UUID
	    +customerId: UUID
	    +storeId: int
	    +ownerUserId: UUID
	    +source: string
	    +status: LeadStatus
    }

    class LeadSqlRepository {
	    -mapper: LeadMapper
	    -transactionContext: TransactionContext
	    +create(lead: Lead) Promise~Lead~
	    +update(lead: Lead) Promise~Lead~
	    +delete(id: UUID) Promise~void~
	    +findById(id: UUID) Promise~Lead?~
	    +listByOwner(userId: UUID) Promise~Lead[]~
	    +listByTeam(teamId: int) Promise~Lead[]~
    }

    class LeadRepositoryFactory {
	    +create(context: TransactionContext) ILeadRepository
    }

    class UserSqlRepository {
	    +create(user: User) Promise~User~
	    +update(user: User) Promise~User~
	    +delete(id: UUID) Promise~void~
	    +findById(id: UUID) Promise~User?~
	    +findByEmail(email: string) Promise~User?~
	    +list() Promise~User[]~
    }

    class TeamSqlRepository {
	    +create(team: Team) Promise~Team~
	    +update(team: Team) Promise~Team~
	    +delete(id: int) Promise~void~
	    +findById(id: int) Promise~Team?~
	    +list() Promise~Team[]~
    }

    class StoreSqlRepository {
	    +create(store: Store) Promise~Store~
	    +update(store: Store) Promise~Store~
	    +delete(id: int) Promise~void~
	    +findById(id: int) Promise~Store?~
	    +list() Promise~Store[]~
    }

    class CustomerSqlRepository {
	    +create(customer: Customer) Promise~Customer~
	    +update(customer: Customer) Promise~Customer~
	    +delete(id: UUID) Promise~void~
	    +findById(id: UUID) Promise~Customer?~
	    +findByEmail(email: string) Promise~Customer?~
	    +list() Promise~Customer[]~
    }

    class DealSqlRepository {
	    +create(deal: Deal) Promise~Deal~
	    +update(deal: Deal) Promise~Deal~
	    +delete(id: UUID) Promise~void~
	    +findById(id: UUID) Promise~Deal?~
	    +findActiveByLeadId(leadId: UUID) Promise~Deal?~
	    +list() Promise~Deal[]~
    }

    class AuditLogSqlRepository {
	    +create(log: AuditLog) Promise~AuditLog~
	    +list() Promise~AuditLog[]~
    }

    class UserRecord {
	    +id: UUID
	    +name: string
	    +email: string
	    +passwordHash: string
	    +role: string
	    +teamId: int?
    }

    class TeamRecord {
	    +id: int
	    +name: string
	    +managerId: UUID?
    }

    class StoreRecord {
	    +id: int
	    +name: string
    }

    class CustomerRecord {
	    +id: UUID
	    +name: string
	    +email: string?
	    +phone: string?
    }

    class LeadRecord {
	    +id: UUID
	    +customerId: UUID
	    +storeId: int
	    +ownerUserId: UUID
	    +source: string
	    +status: string
    }

    class DealRecord {
	    +id: UUID
	    +leadId: UUID
	    +status: string
	    +stage: string
	    +importance: string
	    +closeReason: string?
    }

    class DealHistoryRecord {
	    +id: int
	    +dealId: UUID
	    +changedByUserId: UUID
	    +previousStatus: string?
	    +newStatus: string?
	    +previousStage: string?
	    +newStage: string?
	    +changedAt: Date
    }

    class AuditLogRecord {
	    +id: hash
	    +actorUserId: UUID
	    +actionType: string
	    +entityName: string
	    +entityId: string
	    +createdAt: Date
    }

	<<interface>> Specification
	<<interface>> IUnitOfWork
	<<enumeration>> UserRole
	<<enumeration>> LeadStatus
	<<enumeration>> DealStatus
	<<enumeration>> DealStage
	<<enumeration>> DealImportance
	<<enumeration>> AuditActionType
	<<interface>> IUserRepository
	<<interface>> ITeamRepository
	<<interface>> IStoreRepository
	<<interface>> ICustomerRepository
	<<interface>> ILeadRepository
	<<interface>> IDealRepository
	<<interface>> IAuditLogRepository
	<<PrismaModel>> UserRecord
	<<PrismaModel>> TeamRecord
	<<PrismaModel>> StoreRecord
	<<PrismaModel>> CustomerRecord
	<<PrismaModel>> LeadRecord
	<<PrismaModel>> DealRecord
	<<PrismaModel>> DealHistoryRecord
	<<PrismaModel>> AuditLogRecord

    IUnitOfWork <|.. UnitOfWork
    UnitOfWork *-- TransactionContext
    AggregateRoot <|-- User
    AggregateRoot <|-- Team
    AggregateRoot <|-- Store
    AggregateRoot <|-- Customer
    AggregateRoot <|-- Lead
    AggregateRoot <|-- Deal
    AggregateRoot <|-- AuditLog
    AggregateRoot o-- "0..*" DomainEvent
    Specification <|.. UserEmailUniqueSpec
    Specification <|.. CustomerEmailUniqueSpec
    Specification <|.. SingleActiveDealPerLeadSpec
    UserEmailUniqueSpec ..> IUserRepository
    CustomerEmailUniqueSpec ..> ICustomerRepository
    SingleActiveDealPerLeadSpec ..> IDealRepository
    LeadController ..> CreateLeadUseCase
    LeadController ..> UpdateLeadUseCase
    LeadController ..> FindLeadUseCase
    LeadController ..> ListOwnLeadsUseCase
    LeadController ..> ListTeamLeadsUseCase
    LeadController ..> ReassignLeadUseCase
    LeadController ..> ConvertLeadUseCase
    LeadController ..> DeleteLeadUseCase
    CreateLeadUseCase ..> ILeadRepository
    CreateLeadUseCase ..> ICustomerRepository
    CreateLeadUseCase ..> IStoreRepository
    CreateLeadUseCase ..> IUserRepository
    CreateLeadUseCase ..> LeadFactory
    CreateLeadUseCase ..> LeadMapper
    CreateLeadUseCase ..> IUnitOfWork
    UpdateLeadUseCase ..> ILeadRepository
    UpdateLeadUseCase ..> LeadMapper
    UpdateLeadUseCase ..> IUnitOfWork
    FindLeadUseCase ..> ILeadRepository
    FindLeadUseCase ..> LeadMapper
    ListOwnLeadsUseCase ..> ILeadRepository
    ListOwnLeadsUseCase ..> LeadMapper
    ListTeamLeadsUseCase ..> ILeadRepository
    ListTeamLeadsUseCase ..> LeadMapper
    ReassignLeadUseCase ..> ILeadRepository
    ReassignLeadUseCase ..> IUserRepository
    ReassignLeadUseCase ..> IUnitOfWork
    ConvertLeadUseCase ..> ILeadRepository
    ConvertLeadUseCase ..> ICustomerRepository
    ConvertLeadUseCase ..> IUnitOfWork
    DeleteLeadUseCase ..> ILeadRepository
    DeleteLeadUseCase ..> IUnitOfWork
    LeadMapper ..> Lead
    LeadMapper ..> LeadSource
    LeadMapper ..> LeadStatus
    LeadMapper ..> CreateLeadDto
    LeadMapper ..> UpdateLeadDto
    LeadMapper ..> LeadResponseDto
    ILeadRepository <|.. LeadSqlRepository
    LeadSqlRepository ..> LeadMapper
    LeadSqlRepository ..> TransactionContext
    LeadRepositoryFactory ..> ILeadRepository
    LeadRepositoryFactory ..> LeadSqlRepository
    IUserRepository <|.. UserSqlRepository
    ITeamRepository <|.. TeamSqlRepository
    IStoreRepository <|.. StoreSqlRepository
    ICustomerRepository <|.. CustomerSqlRepository
    IDealRepository <|.. DealSqlRepository
    IAuditLogRepository <|.. AuditLogSqlRepository
    UserSqlRepository ..> TransactionContext
    TeamSqlRepository ..> TransactionContext
    StoreSqlRepository ..> TransactionContext
    CustomerSqlRepository ..> TransactionContext
    DealSqlRepository ..> TransactionContext
    AuditLogSqlRepository ..> TransactionContext
    LeadSqlRepository ..> LeadRecord
    UserSqlRepository ..> UserRecord
    TeamSqlRepository ..> TeamRecord
    StoreSqlRepository ..> StoreRecord
    CustomerSqlRepository ..> CustomerRecord
    DealSqlRepository ..> DealRecord
    AuditLogSqlRepository ..> AuditLogRecord
    LeadFactory ..> Lead
    LeadFactory ..> LeadSource
    CustomerFactory ..> Customer
    CustomerFactory ..> Name
    CustomerFactory ..> Email
    CustomerFactory ..> Phone
    DealFactory ..> Deal
    DealFactory ..> DealStatus
    DealFactory ..> DealStage
    DealFactory ..> DealImportance
    DealFactory ..> CloseReason
    UserFactory ..> User
    UserFactory ..> Name
    UserFactory ..> Email
    UserFactory ..> PasswordHash
    UserFactory ..> UserRole
```

## Observações

- O projeto usa `PrismaService` e `schema.prisma` como referência de persistência, mas a implementação concreta atual passa por `UnitOfWork` + `TransactionContext` + repositórios SQL (`LeadSqlRepository`, `ContactSqlRepository`, etc.).
- Não existe `PrismaLeadRepository` ou equivalente no código atual; por isso o diagrama mostra `LeadSqlRepository` e os demais repositórios concretos reais.
- Os blocos `Prisma*Model` são representações arquiteturais dos modelos de `prisma/schema.prisma`, não classes materializadas manualmente no projeto.
- O fluxo de eventos observado é: agregado coleta eventos -> use case chama `IDomainEventDispatcher` -> `DomainEventDispatcher` grava em `OutboxEvent` -> `OutboxEventProcessor` lê e despacha para handlers registrados.
